import express from 'express';
import { authenticate } from '../middleware/authenticate.js';


const router = express.Router();


router.patch('/me/avatar', authenticate, async (req, res) => {
  res.status(501).json({ message: 'Avatar upload not implemented yet' });
});

export default router;