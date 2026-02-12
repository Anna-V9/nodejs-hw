import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';


export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw createHttpError(400, 'No file');

    const result = await saveFileToCloudinary(req.file.buffer);

    req.user.avatar = result.secure_url;
    await req.user.save();

    res.status(200).json({ url: req.user.avatar });
  } catch (err) {
    next(err);
  }
};