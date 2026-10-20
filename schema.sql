-- Shoestring backend: Supabase (Postgres), Sydney region (ap-southeast-2).
-- Run in Supabase SQL editor. Row Level Security keeps partners, brokers and buyers separated.

create extension if not exists "pgcrypto";

create table partners (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('real_estate_agent','buyers_agent','accountant','financial_planner','conveyancer')),
  business_name text not null, abn text, slug text unique not null,
  brand jsonb not null default '{}',           -- {name, sub, ink, accent, bar1, bar2, bar3, logo_url}
  licensee_id uuid,                            -- which credit licensee receives finance leads
  referral_fee_disclosure text,                -- shown in the Credit Guide
  created_at timestamptz default now()
);

create table licensees (                       -- e.g. LJ Hooker Home Loans / BetterWayLoan
  id uuid primary key default gen_random_uuid(),
  name text not null, acl_number text not null, afca_member text,
  credit_guide_url text, privacy_policy_url text, complaints_contact text,
  commission_upfront text, commission_trail text
);

create table users (
  id uuid primary key references auth.users(id),
  partner_id uuid references partners(id), licensee_id uuid references licensees(id),
  role text not null check (role in ('platform_admin','partner_admin','partner_user','broker')),
  full_name text, mobile text, email text
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete cascade,
  provider text not null,                      -- Rex, VaultRE, LEAP, Zapier, email_in, manual, corelogic
  method text not null check (method in ('oauth','apikey','partner','zapier','email','manual')),
  secret_ref text,                             -- reference to Supabase Vault secret (never store raw keys)
  status text default 'connected', last_sync_at timestamptz
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id), external_id text,
  address text not null, suburb text, state text, postcode text,
  beds int, baths int, cars int, property_type text, price_guide text, price_num numeric,
  photos jsonb default '[]', open_homes jsonb default '[]', strata boolean default false,
  corelogic_property_id text, created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  kind text not null check (kind in ('property','building_pest','strata','title','contract')),
  source text not null,                        -- corelogic_sandbox | corelogic_partner | corelogic_platform | crm_upload | email_in | inspector_panel | manual
  storage_path text, status text default 'ready', fetched_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  licensee_id uuid references licensees(id),
  name text not null, lender text not null, type text, rate numeric not null, comparison_rate numeric not null,
  features text, tag text, target_market text default 'All borrowers', live boolean default true,
  updated_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id), licensee_id uuid references licensees(id), property_id uuid references properties(id),
  mobile text not null, name text, email text, source text,
  finance_status text, stage text default 'reports_sent',
  chosen_product_id uuid references products(id), indicative_rate numeric,
  created_at timestamptz default now()
);

create table fact_finds (                      -- maps 1:1 to the Customer Information Form fields
  lead_id uuid primary key references leads(id) on delete cascade,
  data jsonb not null, submitted_at timestamptz
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  kind text check (kind in ('licence_front','licence_back','payslip','tax_return','bank_statement')),
  storage_path text not null, uploaded_at timestamptz default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  kind text check (kind in ('sms','credit_guide','privacy','credit_check','declaration')),
  document_version text, ip text, user_agent text, given_at timestamptz default now()
);

create table bid_records (                     -- best interests duty
  lead_id uuid primary key references leads(id) on delete cascade,
  broker_id uuid references users(id), requirements text[], products_considered text[],
  reason text, serviceability jsonb, signed_at timestamptz
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade, product_id uuid references products(id),
  rate numeric, note text, sent_at timestamptz default now()
);

create table audit_log (
  id bigserial primary key, lead_id uuid, actor text, event text not null, detail text, at timestamptz default now()
);

-- Row Level Security (summary; expand per table)
alter table leads enable row level security;
alter table fact_finds enable row level security;
alter table documents enable row level security;
-- Partners see their own leads (contact + stage only via a view); brokers see leads for their licensee.
create policy partner_leads on leads for select using (partner_id = (select partner_id from users where id = auth.uid()));
create policy broker_leads on leads for select using (licensee_id = (select licensee_id from users where id = auth.uid()));
create policy broker_factfind on fact_finds for select using (exists (select 1 from leads l where l.id = lead_id and l.licensee_id = (select licensee_id from users where id = auth.uid())));
create policy broker_docs on documents for select using (exists (select 1 from leads l where l.id = lead_id and l.licensee_id = (select licensee_id from users where id = auth.uid())));
create view partner_lead_view as select id, partner_id, property_id, name, mobile, source, finance_status, stage, created_at from leads;
