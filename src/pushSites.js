var amqp = require('amqplib/callback_api');
const queueName = 'ad-location-queue';
import top500 from './top500';

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
    top500.forEach(site => {
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
