import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, 
    },
    content: {
      type: String,
      default: '', 
      trim: true,
    },
    tag: {
      type: String,
      enum: ['Todo', 'Work', 'Personal', 'Other'], 
      default: 'Todo', 
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);