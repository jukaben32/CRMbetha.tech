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

export async function sendNewLeadEmail(lead: NewLeadAlert): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_ALERT_EMAIL;
  const from = process.env.LEAD_ALERT_FROM ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: `CRM Agencia <${from}>`,
    to,
    subject: `Nuevo lead: ${lead.projectName} — ${lead.name}`,
    html: `
      <h2>Nuevo lead en ${lead.projectName}</h2>
      <p><strong>Nombre:</strong> ${lead.name}</p>
      ${lead.email ? `<p><strong>Email:</strong> ${lead.email}</p>` : ""}
      ${lead.phone ? `<p><strong>Teléfono:</strong> ${lead.phone}</p>` : ""}
      ${lead.message ? `<p><strong>Mensaje:</strong> ${lead.message}</p>` : ""}
      <p><strong>Fuente:</strong> ${lead.source}</p>
    `,
  });
}
