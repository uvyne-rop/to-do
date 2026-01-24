//backend server entry point
//connects firebase admin via db for backend database operations

import express from 'express';  //Web framework to create routes and handle requests.
import cors from 'cors';  //Middleware that allows requests from other domains(react frontend)
import { db } from './config/firebaseAdmin.js';  //Firebase Admin Firestore database connection.

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/test-firebase', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});  //Logs a message when the server is ready.
  