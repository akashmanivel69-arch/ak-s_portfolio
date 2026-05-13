-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pnvkxpvqmnjpnytlcgbn/sql/new

create table if not exists posts (
  id bigserial primary key,
  slug text unique,
  title text,
  cat text,
  excerpt text,
  tags text,
  mins int,
  meta jsonb,
  content text,
  created_at timestamptz default now()
);

create table if not exists projects (
  id bigserial primary key,
  slug text unique,
  title text,
  cat text,
  excerpt text,
  tags text,
  mins int,
  meta jsonb,
  content text,
  created_at timestamptz default now()
);
