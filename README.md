# RideShare Real-Time Analytics Pipeline

A robust, event-driven telemetry system designed to ingest, process, and visualize ride-sharing data in real-time. This project prioritizes **streaming, capturing, and analysis** of data events.

## Core Focus: Event Streaming
Unlike standard applications, this project is built to demonstrate high-throughput event processing:
* **Event Creation**: The home page acts as a dedicated event ingestor, sanitizing and publishing raw telemetry.
* **Live Capture**: A Node.js consumer group listens to the Redpanda stream to aggregate data.
* **Real-Time Analytics**: Data is processed and visualized dynamically on a dedicated dashboard.

---

## How to Use the App

### 1. Create Events (Home Page)
- The main landing page (/) is the Ingestor. Use this to simulate live ride requests and driver availability. This data is streamed immediately into the Redpanda broker.

### 2. View Analytics (Dashboard)
Head over to /dashboard to view the live analytics. Here, the backend consumer provides:

* **Real-Time Stats:** Aggregate counts of requests and available seats.

* **Event Inspection:** A deep-dive view into the JSON payloads of captured events.

* **Route Analytics:** Visual tracking of popular origin and destination pairs.

---

## Tech Stack

-   **Frontend**: React (Vite)
-   **Backend**: TypeScript & Node.js
-   **Message Broker**: Redpanda (Kafka-compatible)
-   **Infrastructure**: Docker

---

## Setup & Installation

This project uses a containerized infrastructure to ensure the message broker is ready for event streaming out of the box.

### 1. Prerequisites
- [Docker & Docker Compose](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (LTS)

### 2. Environment Variables
Create a .env files in the backend/ and frontend/ directory **Use .env.example**

### 3. Starting the Stack
Spin up the docker containers:
```bash
docker-compose up -d --build
```

### 4. For developement without Docker

**Note**: built-in Redpanda container must be running

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Engineering Highlights

Head over to /dashboard to view the live analytics. Here, the backend consumer provides:

* **Resilient Connections:** Implements recursive retry logic for Kafka producers to handle broker boot-up delays.

* **Shared Type System:** Utilizes a central TypeScript definition for events used by both the producer (Frontend) and consumer (Backend).

* **Environment Agnostic:** Fully configured for seamless migration from local Docker to Cloud environments (Vercel/Railway) using Environment Variables.

---

## Project Structure
```
├── shared/             # Shared TypeScript types
├── backend/            # Node.js + TS (Consumer/Producer logic)
│   └── src/services/   # Kafka/Redpanda configuration
├── frontend/           # React App
│   ├── src/features/   # Ingestor & Dashboard components
└── docker-compose.yml  # Redpanda infrastructure
```