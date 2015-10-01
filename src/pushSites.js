var amqp = require('amqplib/callback_api');
let fs = require('fs');
const queueName = 'ad-location-queue';

let top1MRaw = fs.readFileSync('./data/top-1m.csv', 'utf-8');
let top1MLines = top1MRaw.split('\n');
let top1M = top1MLines.map(line => line.split(',')[1]);
top1M.splice(-1);

function handleError(err) {
  if (err) {
    console.error(err);
    process.exit();
  }
}

amqp.connect('amqp://localhost', (err, conn) => {
  handleError(err);
  conn.createChannel((connErr, ch) => {
    handleError(connErr);
    ch.assertQueue(queueName, {
      durable: true
    });
    top1M.forEach(site => {
      ch.sendToQueue(queueName, Buffer(site), {
        persistent: true
      });
      console.log(` [x] Sent ${site}`);
    });
    setTimeout(() => {
      conn.close();
      process.exit(0);
    }, 10000);
  });
});
