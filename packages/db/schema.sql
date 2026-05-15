create table if not exists tokens (
  address text primary key,
  symbol text,
  name text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists token_snapshots (
  id bigserial primary key,
  token_address text not null references tokens(address),
  captured_at timestamptz not null default now(),
  price_usd numeric,
  liquidity_usd numeric,
  volume_1h_usd numeric,
  price_change_1h numeric,
  market_cap_usd numeric,
  fdv_usd numeric,
  raw_overview jsonb
);

create index if not exists idx_token_snapshots_token_time on token_snapshots(token_address, captured_at desc);

create table if not exists holder_snapshots (
  id bigserial primary key,
  token_address text not null references tokens(address),
  captured_at timestamptz not null default now(),
  top10_holder_percent numeric,
  smart_wallet_netflow_usd numeric,
  insider_netflow_usd numeric,
  raw_holder_profile jsonb,
  raw_holder_positions jsonb,
  raw_top_holders jsonb
);

create table if not exists trade_windows (
  id bigserial primary key,
  token_address text not null references tokens(address),
  window_start timestamptz not null,
  window_end timestamptz not null,
  buy_volume_usd numeric,
  sell_volume_usd numeric,
  large_sell_count integer,
  large_buy_count integer,
  remove_liquidity_count integer,
  add_liquidity_count integer,
  raw_txs jsonb
);

create table if not exists token_scores (
  id bigserial primary key,
  token_address text not null references tokens(address),
  scored_at timestamptz not null default now(),
  trap_score integer not null,
  verdict text not null,
  reasons jsonb not null,
  warnings jsonb not null default '[]'::jsonb
);

create index if not exists idx_token_scores_token_time on token_scores(token_address, scored_at desc);
create index if not exists idx_token_scores_score_time on token_scores(trap_score desc, scored_at desc);

create table if not exists token_alerts (
  id bigserial primary key,
  token_address text not null references tokens(address),
  created_at timestamptz not null default now(),
  alert_type text not null,
  trap_score integer not null,
  verdict text not null,
  message text not null,
  delivered_telegram boolean not null default false,
  dedupe_key text not null unique
);

create table if not exists ingestion_runs (
  id bigserial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  tokens_seen integer not null default 0,
  tokens_scored integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);
