-- FOMO Firewall — initial schema migration.
-- Apply via Supabase SQL editor or `psql $DATABASE_URL -f 0001_init.sql`.
-- Every table is idempotent (`create table if not exists`) so re-running is
-- safe during local development.

create table if not exists tokens (
  address text primary key,
  symbol text,
  name text,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create table if not exists token_snapshots (
  id bigserial primary key,
  token_address    text        not null references tokens(address),
  captured_at      timestamptz not null default now(),
  price_usd        numeric,
  liquidity_usd    numeric,
  volume_1h_usd    numeric,
  price_change_1h  numeric,
  liquidity_change_1h numeric,
  market_cap_usd   numeric,
  fdv_usd          numeric,
  raw_overview     jsonb
);

create index if not exists idx_token_snapshots_token_time
  on token_snapshots(token_address, captured_at desc);

create table if not exists holder_snapshots (
  id bigserial primary key,
  token_address              text        not null references tokens(address),
  captured_at                timestamptz not null default now(),
  top10_holder_percent       numeric,
  top_holder_percent         numeric,
  smart_wallet_netflow_usd   numeric,
  insider_netflow_usd        numeric,
  raw_holder_profile         jsonb,
  raw_holder_positions       jsonb,
  raw_top_holders            jsonb
);

create index if not exists idx_holder_snapshots_token_time
  on holder_snapshots(token_address, captured_at desc);

create table if not exists trade_windows (
  id bigserial primary key,
  token_address          text        not null references tokens(address),
  window_start           timestamptz not null,
  window_end             timestamptz not null,
  buy_volume_usd         numeric,
  sell_volume_usd        numeric,
  smart_buy_usd          numeric,
  smart_sell_usd         numeric,
  insider_buy_usd        numeric,
  insider_sell_usd       numeric,
  large_sell_count       integer,
  large_buy_count        integer,
  remove_liquidity_count integer,
  add_liquidity_count    integer,
  raw_txs                jsonb
);

create index if not exists idx_trade_windows_token_time
  on trade_windows(token_address, window_end desc);

create table if not exists token_scores (
  id bigserial primary key,
  token_address text        not null references tokens(address),
  scored_at     timestamptz not null default now(),
  trap_score    integer     not null,
  verdict       text        not null,
  reasons       jsonb       not null,
  warnings      jsonb       not null default '[]'::jsonb,
  analyst_summary text
);

create index if not exists idx_token_scores_token_time
  on token_scores(token_address, scored_at desc);
create index if not exists idx_token_scores_score_time
  on token_scores(trap_score desc, scored_at desc);

create table if not exists token_alerts (
  id bigserial primary key,
  token_address     text        not null references tokens(address),
  created_at        timestamptz not null default now(),
  alert_type        text        not null,
  trap_score        integer     not null,
  verdict           text        not null,
  headline          text        not null,
  message           text        not null,
  delivered_telegram boolean    not null default false,
  dedupe_key        text        not null unique
);

create index if not exists idx_token_alerts_created_at
  on token_alerts(created_at desc);
create index if not exists idx_token_alerts_token_time
  on token_alerts(token_address, created_at desc);

create table if not exists ingestion_runs (
  id bigserial primary key,
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  status         text        not null default 'running',
  tokens_seen    integer     not null default 0,
  tokens_scored  integer     not null default 0,
  alerts_fired   integer     not null default 0,
  errors         jsonb       not null default '[]'::jsonb
);

create table if not exists watchlists (
  id bigserial primary key,
  chat_id        text        not null,
  token_address  text        not null references tokens(address),
  created_at     timestamptz not null default now(),
  unique (chat_id, token_address)
);

create index if not exists idx_watchlists_token on watchlists(token_address);
