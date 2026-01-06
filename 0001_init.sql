create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  nin_or_bvn text not null,
  bank_choice text not null,
  role text not null default 'customer',
  status text not null default 'active',
  suspended_until timestamptz,
  face_template_url text,
  account_number text not null unique,
  password_hash text not null,
  pin_hash text not null,
  failed_login_count integer not null default 0,
  last_failed_login_at timestamptz,
  wrong_pin_count integer not null default 0,
  last_pin_attempt_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  wallet_balance numeric(16,2) not null default 0,
  airtime_balance numeric(16,2) not null default 0,
  data_balance numeric(16,2) not null default 0,
  data_quota numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(16,2) not null,
  kind text not null,
  direction text not null,
  status text not null default 'successful',
  reference text not null,
  metadata jsonb default '{}',
  balance_before numeric(16,2),
  balance_after numeric(16,2),
  created_at timestamptz not null default now()
);

create table if not exists public.pin_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  attempt_type text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  category text not null,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.wallet_total()
returns numeric
language sql
as $$
  select coalesce(sum(wallet_balance), 0) from public.wallets;
$$;
