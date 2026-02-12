import Note from '../models/note.js';
import createHttpError from 'http-errors';
import { TAGS } from '../constants/tags.js';

// -------------------- CREATE --------------------
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

// -------------------- GET ALL --------------------
export const getAllNotes = async (req, res, next) => {
  try {
    const { page = '1', perPage = '10', tag, search } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const perPageNum = Math.max(Number(perPage), 1);

    const filter = { userId: req.user._id };

    if (tag && TAGS.includes(tag)) filter.tag = tag;
    if (search && search.trim() !== '') {
      filter.$text = { $search: search };
    }

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .skip((pageNum - 1) * perPageNum)
        .limit(perPageNum),
    ]);

    res.status(200).json({
      page: pageNum,
      perPage: perPageNum,
      totalNotes,
      totalPages: Math.ceil(totalNotes / perPageNum),
      notes,
    });
  } catch (err) {
    next(err);
  }
};

// -------------------- GET BY ID --------------------
export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      userId: req.user._id,
    });

    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// -------------------- UPDATE --------------------
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};

// -------------------- DELETE --------------------
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      userId: req.user._id,
    });

    if (!note) throw createHttpError(404, 'Note not found');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};