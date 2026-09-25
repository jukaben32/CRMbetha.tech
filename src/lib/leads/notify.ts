import "server-only";
import { Resend } from "resend";

interface NewLeadAlert {
  projectName: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
}

interface OverdueTask {
  title: string;
  dueAt: string | null;
  leadName: string;
  leadId: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function sendNewLeadEmail(lead: NewLeadAlert): Promise<void> {
  const resend = getResend();
  const to = process.env.LEAD_ALERT_EMAIL;
  const from = process.env.LEAD_ALERT_FROM ?? "onboarding@resend.dev";

  if (!resend || !to) {
    return;
  }

  await resend.emails.send({
    from: `CRM Agencia <${from}>`,
    to,
    subject: `Nuevo lead: ${lead.projectName} — ${lead.name}`,
    html: `
      <h2>Nuevo lead en ${escapeHtml(lead.projectName)}</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(lead.name)}</p>
      ${lead.email ? `<p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>` : ""}
      ${lead.phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(lead.phone)}</p>` : ""}
      ${lead.message ? `<p><strong>Mensaje:</strong> ${escapeHtml(lead.message)}</p>` : ""}
      <p><strong>Fuente:</strong> ${escapeHtml(lead.source)}</p>
    `,
  });
}

export async function sendTasksDigestEmail(tasks: OverdueTask[], appUrl: string): Promise<void> {
  const resend = getResend();
  const to = process.env.LEAD_ALERT_EMAIL;
  const from = process.env.LEAD_ALERT_FROM ?? "onboarding@resend.dev";

  if (!resend || !to || tasks.length === 0) {
    return;
  }

  const items = tasks
    .map((task) => {
      const due = task.dueAt
        ? new Date(task.dueAt).toLocaleDateString("es-DO", { day: "2-digit", month: "short" })
        : "sin fecha";
      return `<li><a href="${appUrl}/leads/${task.leadId}">${escapeHtml(task.leadName)}</a> — ${escapeHtml(task.title)} (${due})</li>`;
    })
    .join("");

  await resend.emails.send({
    from: `CRM Agencia <${from}>`,
    to,
    subject: `${tasks.length} tarea(s) pendiente(s) hoy`,
    html: `<h2>Tareas pendientes o vencidas</h2><ul>${items}</ul>`,
  });
}
