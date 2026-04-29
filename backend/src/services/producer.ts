import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'rideshare-backend',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

const producer = kafka.producer();

export const connectProducer = async (retries = 5) => {
  while (retries) {
    try {
      await producer.connect();
      console.log('Connected to Redpanda/Kafka');
      break;
    } catch (err) {
      console.error(`Connection failed. Retries remaining: ${retries - 1}`);
      retries -= 1;
      if (retries === 0) {
        console.error('Could not connect to Kafka. Exiting...');
        process.exit(1);
      }
      // Wait 5 seconds before trying again
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

export const sendEvent = async (topic: string, message: any) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};