import express from 'express';
import cors from 'cors';
import { Kafka, Partitioners } from 'kafkajs';
import { EventType } from '../../shared/types.js';
import type { TransportEvent } from '../../shared/types.js';

const app = express();
app.use(cors());
app.use(express.json());

// Set port to match your Docker port mapping
const kafka = new Kafka({ clientId: 'ride-app', brokers: ['localhost:8080'] });


const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
const consumer = kafka.consumer({ groupId: 'analytics-group' });

// events are stored here
let eventStore: TransportEvent[] = [];

app.post('/api/events', async (req, res) => {
  try {
    await producer.send({
      topic: 'ride-events',
      messages: [{ value: JSON.stringify(req.body) }],
    });
    res.sendStatus(202);
  } catch (error) {
    res.status(500).json({ error: 'Failed to produce event' });
  }
});

app.get('/api/analytics', (req, res) => {
  res.json(eventStore);
});

const start = async () => {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'ride-events', fromBeginning: true });

  await consumer.run({
  eachMessage: async ({ message }) => {
    if (!message.value) return;
    const event: TransportEvent = JSON.parse(message.value.toString());
    
    eventStore.push(event);
    
    console.log(`Event collected. Total history size: ${eventStore.length}`);
  },
});

  app.listen(3000, () => console.log('Backend running at http://localhost:3000'));
};

start().catch(console.error);