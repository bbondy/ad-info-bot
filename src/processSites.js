var amqp = require('amqplib/callback_api');
let fs = require('fs');
import {init, getAdInfo, exit} from 'ad-info';
var amqp = require('amqplib/callback_api');

// If true, output file includes:
// - numResourcesRequested (Number)
// - numResourcesBlocked (Number)
// - resourcesBlocked (Array)
// - iframesData (Array)
// - pageLoadTime (number of milliseconds it took to load the page)
// - abpTime (number of milliseconds spent using ad block plus filter lookups on each URL)
// If false, only includes an Array of the iframe data.
// Queues and output filenames will differ too.
let verbose = false;
const verboseSuffix = verbose ? '-verbose' : '';
const queueName = 'ad-location-queue' + verboseSuffix;
const jsonFilename = './perSiteInfo' + verboseSuffix + '.json'

let perSiteInfo = {};
if (fs.existsSync(jsonFilename)) {
  perSiteInfo = JSON.parse(fs.readFileSync(jsonFilename, 'utf-8'));
}

console.log('[*] Waiting for messages. To exit press CTRL+C');

function handleError(err) {
  if (err) {
    console.error(err);
    process.exit();
  }
}

let sequence = init('./node_modules/ad-info/data/easylist.txt').then(() => {
  amqp.connect('amqp://localhost', (err, conn) => {
    handleError(err);
    conn.createChannel((connErr, ch) => {
      handleError(connErr);
      var q = 'ad-info-queue';
      ch.assertQueue(queueName, {durable: true});

      // Only send 1 message until previous one is ack'ed
      ch.prefetch(1);

      ch.consume(queueName, (msg) => {
        let siteHost = msg.content.toString();
        console.log(`http://${siteHost}`);

        getAdInfo(`http://${siteHost}`).then((info) => {
          // To save space, only add information if there are ads on the page
          if (verbose) {
            perSiteInfo[siteHost] = info;
            fs.writeFileSync(jsonFilename, JSON.stringify(perSiteInfo));
          // In non verbose mode there's no entropy for storing empty arrays per site,
          // it's better to save the space.
          } else if (info.iframesData.length > 0) {
            perSiteInfo[siteHost] = info.iframesData;
            fs.writeFileSync(jsonFilename, JSON.stringify(perSiteInfo));
          }
          // Tell the queue we processed the site
          ch.ack(msg);
        }).catch((err) => {
          console.warn('Error obtaining info for site host:', siteHost, '. Error:', err);
          // Tell the queue we processed the site. This queue will be refilled periodically anyway.
          ch.ack(msg);
        });
      }, {
        noAck: false
      });
    });
  });
});
