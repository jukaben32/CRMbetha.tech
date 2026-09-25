"use client";

import { useActionState, useTransition } from "react";
import { addTask, toggleTask, type AddTaskState } from "./tasks-actions";

export interface TaskItem {
  id: string;
  title: string;
  due_at: string | null;
  done: boolean;
}

const initialState: AddTaskState = {};

function isOverdue(task: TaskItem): boolean {
  if (task.done || !task.due_at) return false;
  return new Date(task.due_at).getTime() < Date.now();
}

export function TaskList({ leadId, initialTasks }: { leadId: string; initialTasks: TaskItem[] }) {
  const addTaskForLead = addTask.bind(null, leadId);
  const [state, formAction, isPending] = useActionState(addTaskForLead, initialState);
  const [, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs text-muted" htmlFor="title">
            Tarea
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="Ej. Llamar para dar seguimiento"
            className="rounded-lg border border-surface-border bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted" htmlFor="due_at">
            Fecha límite
          </label>
          <input
            id="due_at"
            name="due_at"
            type="date"
            className="rounded-lg border border-surface-border bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Agregar"}
        </button>
      </form>
      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {initialTasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 border-t border-surface-border pt-2 text-sm first:border-0 first:pt-0"
          >
            <input
              type="checkbox"
              defaultChecked={task.done}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                startTransition(() => {
                  toggleTask(task.id, leadId, checked);
                });
              }}
              className="h-4 w-4 rounded border-surface-border accent-[var(--accent)]"
            />
            <span className={task.done ? "flex-1 text-muted line-through" : "flex-1"}>
              {task.title}
            </span>
            {task.due_at && (
              <span className={isOverdue(task) ? "text-xs text-red-400" : "text-xs text-muted"}>
                {new Date(task.due_at).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })}
              </span>
            )}
          </li>
        ))}
        {initialTasks.length === 0 && <p className="text-sm text-muted">Sin tareas pendientes.</p>}
      </ul>
    </div>
  );
}
