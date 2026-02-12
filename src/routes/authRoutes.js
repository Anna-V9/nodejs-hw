import express from 'express';
import { celebrate } from 'celebrate';
import {
  requestResetEmail,
  resetPassword,
  registerUser,
  loginUser,
  logoutUser,
  refreshUserSession,
} from '../controllers/authController.js';
import {
  requestResetEmailSchema,
  resetPasswordSchema,
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';

const router = express.Router();


router.post(
  '/auth/request-reset-email',
  celebrate({ body: requestResetEmailSchema }),
  requestResetEmail
);


router.post(
  '/auth/reset-password',
  celebrate({ body: resetPasswordSchema }),
  resetPassword
);


router.post(
  '/auth/register',
  celebrate({ body: registerUserSchema }),
  registerUser
);


router.post(
  '/auth/login',
  celebrate({ body: loginUserSchema }),
  loginUser
);


router.post('/auth/logout', logoutUser);


router.post('/auth/refresh', refreshUserSession);

export default router;