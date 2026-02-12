import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import notesRouter from './routes/notesRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors as celebrateErrors } from 'celebrate'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());
app.use(logger); 

/* ---------- Routes ---------- */
app.use(notesRouter);

/* ---------- Celebrate validation errors ---------- */
app.use(celebrateErrors()); 

/* ---------- Handlers ---------- */
app.use(notFoundHandler);
app.use(errorHandler);

/* ---------- Start Server ---------- */
const startServer = async () => {
  try {
    await connectMongoDB(); 
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();