import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import httpErrors from 'http-errors';
const { createHttpError } = httpErrors;
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import dotenv from 'dotenv';
import { createSession, setSessionCookies } from '../services/auth.js';

dotenv.config();


export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, 'Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, username });

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    next(err);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw createHttpError(401, 'Invalid email or password');

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    next(err);
  }
};


export const logoutUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (accessToken) {
      await Session.deleteOne({ accessToken });
      res.clearCookie('accessToken');
    }
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};


export const refreshUserSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw createHttpError(401, 'Missing refresh token');

    const session = await Session.findOne({ refreshToken });
    if (!session || session.refreshTokenValidUntil < new Date())
      throw createHttpError(401, 'Refresh token expired');

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed successfully' });
  } catch (err) {
    next(err);
  }
};


export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const templateFile = fs.readFileSync(
      path.join('src/templates/reset-password-email.html'),
      'utf-8'
    );

    const template = handlebars.compile(templateFile);
    const html = template({
      name: user.username,
      link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`,
    });

    await sendEmail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html,
    });

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};


export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw createHttpError(401, 'Invalid or expired token');
    }

    const user = await User.findOne({ _id: payload.sub, email: payload.email });
    if (!user) throw createHttpError(404, 'User not found');

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};