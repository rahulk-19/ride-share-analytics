import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { producer, consumer, connectKafka } from './services/kafka.js';
import type { TransportEvent } from '../../shared/types.js';

const app = express();
app.use(cors());
app.use(express.json());

let eventStore: TransportEvent[] = [];

app.post('/api/events', async (req, res) => {
  try {
    await producer.send({
      topic: 'ride-events',
      messages: [{ value: JSON.stringify(req.body) }],
    });
    res.sendStatus(202);
  } catch (error) {
    res.status(500).json({ error: 'Streaming failed' });
  }
});

app.get('/api/analytics', (req, res) => {
  res.json(eventStore);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const start = async () => {
  try {
    // Connect via our service
    await connectKafka();

    await consumer.subscribe({ topic: 'ride-events', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const event: TransportEvent = JSON.parse(message.value.toString());
        eventStore.push(event);
      },
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  } catch (err) {
    console.error('Startup crash:', err);
  }
};

start();