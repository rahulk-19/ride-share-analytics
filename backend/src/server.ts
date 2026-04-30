import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectKafka, getProducer, getConsumer } from './services/kafka.js';
import type { TransportEvent } from '../../shared/types.js';

const app = express();
app.use(cors());
app.use(express.json());

const eventStore: TransportEvent[] = [];

app.post('/api/events', async (req, res) => {
  try {
    const producer = getProducer();
    await producer.send({
      topic: 'ride-events',
      messages: [{ value: JSON.stringify(req.body) }],
    });
    res.sendStatus(202);
  } catch (error) {
    console.error('Producer error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

app.get('/api/analytics', (_req, res) => {
  res.json(eventStore);
});

app.get('/health', async (_req, res) => {
  try {
    const producer = getProducer();
    res.json({ 
      status: 'healthy', 
      kafka: 'connected',
      broker: process.env.KAFKA_BROKERS 
    });
  } catch {
    res.status(500).json({ status: 'unhealthy', kafka: 'disconnected' });
  }
});

const start = async () => {
  try {
    await connectKafka();

    const consumer = getConsumer();
    await consumer.subscribe({ topic: 'ride-events', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const event: TransportEvent = JSON.parse(message.value.toString());
        eventStore.push(event);
      },
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  } catch (err) {
    console.error('Startup crash:', err);
    process.exit(1);
  }
};

start();