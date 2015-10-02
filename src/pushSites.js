var amqp = require('amqplib/callback_api');
let fs = require('fs');
import {initAMQPChannel} from './amqp.js';

const queueName = 'ad-location-queue';

let top1MRaw = fs.readFileSync('./data/top-1m.csv', 'utf-8');
let top1MLines = top1MRaw.split('\n');
let top1M = top1MLines.map(line => line.split(',')[1]);
top1M.splice(-1);

initAMQPChannel('amqp://localhost')
  .then(({ch, conn}) => {
    ch.assertQueue(queueName, {
      durable: true
    });
    top1M.forEach((site, i) => {
      ch.sendToQueue(queueName, Buffer(site), {
        persistent: true
      });
      console.log(` [x] Sent ${site}`);
      if (i === top1M.length - 1) {
        setTimeout(() => {
          conn.close();
          process.exit(0);
        }, 10000);
      }
    });
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });
