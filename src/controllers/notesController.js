import createHttpError from 'http-errors';
import Note from '../models/note.js';
import { TAGS } from '../constants/tags.js';


export const getAllNotes = async (req, res, next) => {
  try {
    const pageNum = Math.max(Number(req.query.page) || 1, 1);
    const perPageNum = Math.min(Math.max(Number(req.query.perPage) || 10, 5), 20);
    const { tag, search } = req.query;

    const filter = {};
    if (tag && TAGS.includes(tag)) filter.tag = tag;
    if (search && search.trim() !== '') filter.$text = { $search: search };

    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .skip((pageNum - 1) * perPageNum)
        .limit(perPageNum),
    ]);

    const totalPages = Math.ceil(totalNotes / perPageNum);

    res.status(200).json({ page: pageNum, perPage: perPageNum, totalNotes, totalPages, notes });
  } catch (err) {
    next(err);
  }
};


export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};


export const createNote = async (req, res, next) => {
  try {
    const newNote = await Note.create(req.body);
    res.status(201).json(newNote);
  } catch (err) {
    next(err);
  }
};


export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.noteId);
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};


export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.noteId, req.body, { new: true });
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};