-- REUNITE phase 1 schema.
-- Status changes (payment, moderation) run on the server with the service role;
-- row level security below only governs what browsers can read and write directly.

create type report_kind as enum ('missing', 'found');
create type report_status as enum ('awaiting_payment', 'pending_review', 'published', 'rejected', 'resolved', 'archived');
create type payment_kind as enum ('post_fee', 'bounty');
create type payment_status as enum ('pending', 'paid', 'failed', 'expired');
create type bounty_status as enum ('pending', 'active', 'refunded', 'paid_out');

create sequence report_code_seq start 24100;

create table reports (
  id uuid primary key default gen_random_uuid(),
  case_code text not null unique default ('RN-' || nextval('report_code_seq')),
  kind report_kind not null,
  status report_status not null default 'awaiting_payment',
  reporter_id uuid references auth.users (id) on delete set null,
  full_name text,
  age int check (age between 0 and 120),
  age_range text,
  gender text check (gender in ('Laki-laki', 'Perempuan')),
  nationality text default 'Indonesia',
  event_at timestamptz not null,
  city text not null,
  address text not null,
  features text not null,
  height_weight text,
  hair text,
  clothing text,
  chronology text,
  condition text,
  shelter_name text,
  shelter_address text,
  reporter_name text not null,
  reporter_relation text,
  contact_phone text not null,
  photo_url text,
  ktp_path text,
  face_blur boolean not null default false,
  consent_at timestamptz not null,
  reject_reason text,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz
);

create index reports_public_idx on reports (status, kind, published_at desc);

create table payments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  payer_id uuid references auth.users (id) on delete set null,
  kind payment_kind not null,
  bounty_idr bigint not null default 0 check (bounty_idr >= 0),
  commission_idr bigint not null default 0 check (commission_idr >= 0),
  post_fee_idr bigint not null default 0 check (post_fee_idr >= 0),
  total_idr bigint not null check (total_idr > 0),
  status payment_status not null default 'pending',
  provider text not null,
  provider_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table bounties (
  report_id uuid primary key references reports (id) on delete cascade,
  amount_idr bigint not null check (amount_idr > 0),
  status bounty_status not null default 'pending',
  payment_id uuid references payments (id),
  activated_at timestamptz
);

create table sightings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  sender_id uuid references auth.users (id) on delete set null,
  sender_name text,
  seen_at timestamptz,
  location text not null,
  message text not null,
  contact text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table hoax_flags (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  flagged_by uuid references auth.users (id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table reports enable row level security;
alter table payments enable row level security;
alter table bounties enable row level security;
alter table sightings enable row level security;
alter table hoax_flags enable row level security;

create policy "published reports are public" on reports
  for select using (status = 'published' or status = 'resolved');
create policy "reporters see their own reports" on reports
  for select to authenticated using (reporter_id = auth.uid());

create policy "payers see their own payments" on payments
  for select to authenticated using (payer_id = auth.uid());

create policy "active bounties are public" on bounties
  for select using (
    status = 'active' and exists (select 1 from reports r where r.id = report_id and r.status = 'published')
  );
create policy "reporters see their own bounty" on bounties
  for select to authenticated using (
    exists (select 1 from reports r where r.id = report_id and r.reporter_id = auth.uid())
  );

create policy "reporters read sightings on their reports" on sightings
  for select to authenticated using (
    exists (select 1 from reports r where r.id = report_id and r.reporter_id = auth.uid())
  );

-- Storage: photos are public once linked to a published report; KTP files are never public.
insert into storage.buckets (id, name, public) values ('report-photos', 'report-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('ktp', 'ktp', false)
  on conflict (id) do nothing;
