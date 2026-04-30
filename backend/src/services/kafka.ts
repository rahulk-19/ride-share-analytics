import { Kafka, Partitioners} from 'kafkajs';
import type { SASLOptions } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const sasl: SASLOptions | undefined = process.env.KAFKA_SASL === 'true' 
  ? {
      mechanism: 'scram-sha-256',
      username: process.env.KAFKA_USERNAME || '',
      password: process.env.KAFKA_PASSWORD || '',
    } 
  : undefined;

const kafka = new Kafka({
  clientId: 'ride-app',
  brokers: [process.env.KAFKA_BROKERS || 'redpanda:8080'],
  ssl: process.env.KAFKA_SASL === 'true',
  sasl: sasl,
  retry: { initialRetryTime: 300, retries: 10 }
});

// Export the instances directly
export const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
export const consumer = kafka.consumer({ groupId: 'analytics-group' });

export const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log('Kafka Producer & Consumer Connected');
};