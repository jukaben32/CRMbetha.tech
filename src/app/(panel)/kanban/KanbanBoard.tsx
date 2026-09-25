"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { STAGES } from "@/lib/leads/query";
import { updateLeadStage } from "./actions";

export interface KanbanLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  stage: string;
  projects: { name: string; color: string } | null;
}

function LeadCard({ lead }: { lead: KanbanLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`glass-card cursor-grab select-none p-3 text-sm active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <Link
        href={`/leads/${lead.id}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium hover:text-accent"
      >
        {lead.name}
      </Link>
      <p className="mt-1 text-xs text-muted">{lead.email || lead.phone || "sin contacto"}</p>
      {lead.projects && (
        <span
          className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs"
          style={{ backgroundColor: `${lead.projects.color}22`, color: lead.projects.color }}
        >
          {lead.projects.name}
        </span>
      )}
    </div>
  );
}

function Column({
  stage,
  label,
  leads,
}: {
  stage: string;
  label: string;
  leads: KanbanLead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`glass-card flex min-h-[200px] w-72 shrink-0 flex-col gap-2 p-3 transition ${
        isOver ? "ring-1 ring-accent" : ""
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
        <span className="text-xs text-muted">{leads.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialLeads }: { initialLeads: KanbanLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStage = String(over.id);
    const previous = leads;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    setLeads((current) =>
      current.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );

    const result = await updateLeadStage(leadId, newStage);
    if (result.error) {
      setLeads(previous);
      setErrorMessage(result.error);
    }
  }

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      {errorMessage && (
        <p className="text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <Column
              key={s.value}
              stage={s.value}
              label={s.label}
              leads={leads.filter((l) => l.stage === s.value)}
            />
          ))}
        </div>
        <DragOverlay>{activeLead ? <LeadCard lead={activeLead} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
