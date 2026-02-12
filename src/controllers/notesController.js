import createHttpError from 'http-errors';
import Note from '../models/note.js';
import { TAGS } from '../constants/tags.js';



export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;

    const filter = {};


    if (tag && TAGS.includes(tag)) {
      filter.tag = tag;
    }


    if (search && search.trim() !== '') {
      filter.$text = { $search: search };
    }

    const totalNotes = await Note.countDocuments(filter);
    const totalPages = Math.ceil(totalNotes / perPage);

    const notes = await Note.find(filter)
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json({
      page: Number(page),
      perPage: Number(perPage),
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};


export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
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
    const { noteId } = req.params;

    const note = await Note.findByIdAndDelete(noteId);
    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};


export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndUpdate(noteId, req.body, { new: true });
    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
};