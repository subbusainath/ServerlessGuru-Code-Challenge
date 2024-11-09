import z from 'zod';
import { notesSchema, updateNoteSchema } from '../middleware/middyValidator';
import { LogLevel } from '@aws-lambda-powertools/logger';
export type NoteInput = z.infer<typeof notesSchema>;

export type NoteOutput = {
  noteId: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
};

export type Note = z.infer<typeof updateNoteSchema>;

export type logLevelType = (typeof LogLevel)[keyof typeof LogLevel];
