## Sort My Scene - Real-Time Ticketing Platform

A full-stack MERN application designed to handle high-concurrency event ticketing. This platform ensures secure authentication, real-time seat synchronization, and strict database-level concurrency controls to prevent race conditions during the checkout process.

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, Axios, Socket.io-client

**Backend:** Node.js, Express.js, Socket.io, Node-Cron

**Database:** MongoDB, Mongoose (with ACID Transactions)

**Security:** JWT (JSON Web Tokens) via HTTP-Only Cookies

## How to Run Locally

### Prerequisites

* Node.js
* A MongoDB connection string (Local or MongoDB Atlas)

### 1. Backend Setup

Open a terminal and navigate to the backend directory.

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root of the backend folder and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=super_secret_jwt_key_change_in_production
NODE_ENV=development
```

Seed the database with an initial event and seats:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory.

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

## Core Design Decisions & Architecture

### 1. Preventing Double Bookings (Race Conditions)

To ensure two users cannot book the exact same seat simultaneously, the application does not rely on frontend validation. Instead, it utilizes MongoDB ACID Transactions coupled with Atomic Updates.

When a user attempts to reserve a seat, the backend executes an `updateMany` query that explicitly requires the seat's status to be exactly `'available'`.

If User A and User B click the same seat simultaneously, the database locks the document. User A's transaction succeeds, changing the status to `'reserved'`. User B's transaction then evaluates the query, finds 0 available seats matching that ID, and rolls back the transaction, returning a `409 Conflict` error to the UI.

### 2. The "Orphaned Seat" Problem (Cron Worker)

When a user reserves a seat, it locks for 10 minutes. If the user closes their browser tab or loses internet connection, the frontend timer is destroyed, leaving the seat permanently locked in a "zombie" state.

**Solution:** A background worker (`node-cron`) is initialized on the server. It sweeps the Reservations collection every 60 seconds, automatically identifying expired database timestamps, releasing the locked seats back to the public pool, and deleting the orphaned reservation documents.

### 3. Real-Time UI Synchronization (WebSockets)

To prevent users from clicking seats that were just locked by someone else, the application uses Socket.io.

Rather than forcing the client to heavily poll the server, the server acts as the source of truth. Whenever a transaction successfully completes (Reservation, Cancellation, or Booking), the server emits a broadcast event.

All connected React clients listen for this event and silently re-fetch the grid, ensuring the UI is always perfectly synced with the database state in real-time.

### 4. Security (HTTP-Only Cookies)

Instead of storing JWTs in `localStorage` (which is highly vulnerable to Cross-Site Scripting / XSS attacks), authentication tokens are securely baked into HTTP-Only Cookies. The React frontend utilizes Axios interceptors configured with `withCredentials: true` to automatically and securely transmit the identity payload on every request.

## Assumptions Made

**Payment Gateway:** Simulated. Moving a seat from reserved to booked bypasses an actual Stripe/Razorpay integration for the scope of this assignment.

**Seat Selection:** Users are permitted to select and reserve multiple seats in a single transaction array.

**Time-to-Live (TTL):** A standard 10-minute cart lock is assumed to be an adequate window for a user to complete their booking.
