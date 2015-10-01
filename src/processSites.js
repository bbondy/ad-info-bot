var amqp = require('amqplib/callback_api');
const queueName = 'ad-location-queue';

var amqp = require('amqplib/callback_api');

console.log('[*] Waiting for messages. To exit press CTRL+C');

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
    var q = 'ad-info-queue';
    ch.assertQueue(queueName, {durable: true});

    // Only send 1 message until previous one is ack'ed
    ch.prefetch(1);

    ch.consume(queueName, (msg) => {
      setTimeout(() => {
        console.log(" [x] Processed %s", msg.content.toString());
        // Tell the queue we processed the site
        ch.ack(msg);
      }, 1000);
    }, {
      noAck: false
    });
  });
});
