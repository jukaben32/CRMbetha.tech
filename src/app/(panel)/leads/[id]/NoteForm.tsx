"use client";

import { useActionState } from "react";
import { addNote, type AddNoteState } from "./actions";

const initialState: AddNoteState = {};

export function NoteForm({ leadId }: { leadId: string }) {
  const addNoteForLead = addNote.bind(null, leadId);
  const [state, formAction, isPending] = useActionState(addNoteForLead, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Escribe una nota o el resultado de la llamada..."
        className="rounded-lg border border-surface-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar nota"}
      </button>
    </form>
  );
}
