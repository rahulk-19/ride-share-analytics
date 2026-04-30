import { Kafka, Partitioners, type Producer, type Consumer } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
  clientId: 'ride-app',
  brokers: [process.env.KAFKA_BROKERS || ''],
  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256' as const,
    username: process.env.KAFKA_USERNAME || '',
    password: process.env.KAFKA_PASSWORD || '',
  },
  retry: { initialRetryTime: 300, retries: 10 },
});

let producer: Producer;
let consumer: Consumer;

export const connectKafka = async () => {
  const admin = kafka.admin();
  await admin.connect();

  const topics = await admin.listTopics();
  if (!topics.includes('ride-events')) {
    await admin.createTopics({
      topics: [{ topic: 'ride-events', numPartitions: 1 }],
    });
  }
  await admin.disconnect();

  producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
  consumer = kafka.consumer({ groupId: 'analytics-group' });

  await producer.connect();
  await consumer.connect();
  console.log('Kafka Producer & Consumer Connected');
};

export const getProducer = () => producer;
export const getConsumer = () => consumer;