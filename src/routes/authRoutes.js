import express from 'express';
import { celebrate } from 'celebrate';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';

const router = express.Router();

// Реєстрація
router.post(
  '/auth/register',
  celebrate({ body: registerUserSchema }),
  registerUser
);

// Логін
router.post(
  '/auth/login',
  celebrate({ body: loginUserSchema }),
  loginUser
);

// Оновлення сесії
router.post('/auth/refresh', refreshUserSession);

// Логаут
router.post('/auth/logout', logoutUser);

export default router;