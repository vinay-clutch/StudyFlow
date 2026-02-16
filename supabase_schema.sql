-- StudyFlow Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Roadmaps Table
create table if not exists public.roadmaps (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    description text,
    videos jsonb default '[]'::jsonb,
    total_progress integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tasks / Planner Table
create table if not exists public.tasks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    status text default 'todo' check (status in ('todo', 'doing', 'done')),
    priority text default 'medium' check (priority in ('low', 'medium', 'high')),
    due_date text,
    tags text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Allows users to only see their own data
alter table public.roadmaps enable row level security;
alter table public.tasks enable row level security;

create policy "Users can only access their own roadmaps" 
on public.roadmaps for all 
using (auth.uid() = user_id);

create policy "Users can only access their own tasks" 
on public.tasks for all 
using (auth.uid() = user_id);
