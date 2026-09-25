-- IP del remitente, para investigar abuso y como base del rate-limit
-- del endpoint público /api/leads.
alter table leads add column if not exists ip text;
create index if not exists leads_ip_created_at_idx on leads(ip, created_at desc);
