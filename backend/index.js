import express from 'express';
import cors from 'cors';
import { db } from './config/firebaseAdmin.js';

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
});
