import { infer } from 'zod'
import {notesSchema, updateNoteSchema} from "../middleware/middyValidator";



export type NoteInput = infer<typeof notesSchema>

export type NoteOutput = {
    noteId: string,
    notes: Note[],
    createdAt: string,
    updatedAt: string
}

export type Note = infer<typeof updateNoteSchema>
