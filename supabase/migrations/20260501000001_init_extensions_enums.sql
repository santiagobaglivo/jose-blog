create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- Enums
create type user_role as enum ('admin', 'user');
create type post_status as enum ('draft', 'scheduled', 'published', 'archived');
create type comment_status as enum ('pending', 'approved', 'rejected', 'spam');
create type case_status as enum ('new', 'in_review', 'in_progress', 'resolved', 'closed');
create type case_priority as enum ('low', 'medium', 'high');
create type moderation_target as enum ('comment', 'thread', 'reply', 'user');
create type moderation_action as enum ('approve','reject','delete','pin','lock','hide','suspend');
