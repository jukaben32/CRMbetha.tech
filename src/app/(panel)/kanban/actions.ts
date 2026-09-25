"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STAGES, type Stage } from "@/lib/leads/query";

const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));

function isStage(value: string): value is Stage {
  return STAGES.some((s) => s.value === value);
}

export async function updateLeadStage(
  leadId: string,
  newStage: string
): Promise<{ error?: string }> {
  if (!isStage(newStage)) {
    return { error: "Etapa inválida" };
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("leads")
    .select("stage")
    .eq("id", leadId)
    .maybeSingle();

  if (!current) {
    return { error: "Lead no encontrado" };
  }

  if (current.stage === newStage) {
    return {};
  }

  const { error } = await supabase
    .from("leads")
    .update({ stage: newStage })
    .eq("id", leadId);

  if (error) {
    return { error: "No se pudo mover el lead" };
  }

  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    body: `Etapa cambiada: ${STAGE_LABEL[current.stage] ?? current.stage} → ${STAGE_LABEL[newStage]}`,
  });

  revalidatePath("/kanban");
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);

  return {};
}
