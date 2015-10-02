import {initAMQPChannel} from './amqp.js';
const queueName = 'ad-location-queue';

initAMQPChannel('amqp://localhost')
  .then(({ch, conn}) => {
    ch.deleteQueue(queueName);
    setTimeout(() => {
      conn.close();
      process.exit(0);
    }, 1000);
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });
