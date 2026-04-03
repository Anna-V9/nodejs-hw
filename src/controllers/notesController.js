import createHttpError from 'http-errors';
import Note from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (err) {
    next(err); // передаємо помилку у middleware
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
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      req.body,
      { new: true }
    );
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};