var amqp = require('amqplib/callback_api');
let fs = require('fs');
import {init, getAdInfo, exit} from 'ad-info';

const queueName = 'ad-location-queue';

var amqp = require('amqplib/callback_api');

let perSiteInfo = {};
if (fs.existsSync('./perSiteInfo.json')) {
  perSiteInfo = JSON.parse(fs.readFileSync('./perSiteInfo.json', 'utf-8'));
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
          perSiteInfo[siteHost] = info;
          fs.writeFileSync('./perSiteInfo.json', JSON.stringify(perSiteInfo));
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
