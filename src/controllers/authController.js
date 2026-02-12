import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';



export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(400, 'Email in use');

 
    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      email,
      password: hashedPassword,
      username: email, 
    });


    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user); 
  } catch (err) {
    next(err);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw createHttpError(401, 'Invalid credentials');

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user); 
  } catch (err) {
    next(err);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;
    if (!sessionId || !refreshToken) throw createHttpError(401, 'Session not found');

    const oldSession = await Session.findOne({ _id: sessionId, refreshToken });
    if (!oldSession) throw createHttpError(401, 'Session not found');

    if (oldSession.refreshTokenValidUntil < new Date()) {
      await oldSession.deleteOne();
      throw createHttpError(401, 'Session token expired');
    }

    const userId = oldSession.userId;
    await oldSession.deleteOne();

    const session = await createSession(userId);
    setSessionCookies(res, session);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;
    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }


    res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'none' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
    res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};