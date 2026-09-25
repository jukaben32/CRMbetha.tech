"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AddNoteState {
  error?: string;
}

export async function addNote(
  leadId: string,
  _prevState: AddNoteState,
  formData: FormData
): Promise<AddNoteState> {
  const body = formData.get("body");
  if (typeof body !== "string" || !body.trim()) {
    return { error: "Escribe algo antes de guardar." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lead_notes").insert({
    lead_id: leadId,
    body: body.trim(),
  });

  if (error) {
    return { error: "No se pudo guardar la nota." };
  }

  revalidatePath(`/leads/${leadId}`);
  return {};
}
