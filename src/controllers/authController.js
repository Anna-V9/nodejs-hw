import { User } from '../models/user.js';
import httpErrors from 'http-errors';
const { createHttpError } = httpErrors;
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import dotenv from 'dotenv';

dotenv.config();


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

    try {
      await sendEmail({ to: user.email, subject: 'Reset your password', html });
    } catch  {
      throw createHttpError(500, 'Failed to send the email, please try again later.');
    }

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