import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());
app.use(pinoHttp());

/* ---------- Routes ---------- */

// Get all notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// Get note by ID
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// Test error route
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

/* ---------- 404 Middleware ---------- */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

/* ---------- Error Handler ---------- */
app.use((err, req, res, _next) => {
  void _next;
  res.status(500).json({
    message: err.message,
  });
});

/* ---------- Server ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});