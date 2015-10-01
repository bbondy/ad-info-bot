var amqp = require('amqplib/callback_api');

/**
 * Returns a promise for the channel on the specified host
 */
export function initAMQPChannel(verbose, path) {
  return new Promise((resolve, reject) => {
    amqp.connect(path, (err, conn) => {
      if (err) {
        reject(err);
        return;
      }
      conn.createChannel((connErr, ch) => {
        if (connErr) {
          reject(connErr);
          return;
        }

        // Only send 1 message until previous one is ack'ed
        ch.prefetch(1);
        resolve({ ch, conn});
      });
    });
  });
}
