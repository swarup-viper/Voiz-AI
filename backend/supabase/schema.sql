-- Schema for Feedback to Opportunity Map

-- Table: feedback
-- Stores the original raw unstructured feedback items
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  audience_type text not null,
  text text not null,
  created_at timestamptz default now()
);

-- Table: insights
-- Stores structured insights extracted from raw feedback by Claude
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid references feedback(id) on delete cascade,
  theme text,
  category text,
  type text check (type in ('complaint', 'suggestion', 'praise')),
  sentiment text check (sentiment in ('negative', 'neutral', 'positive')),
  urgency int check (urgency between 1 and 5),
  who_affected text,
  evidence_quote text,
  quote_verified boolean default false,
  created_at timestamptz default now()
);

-- Index for grouping and filtering by theme
create index if not exists idx_insights_theme on insights(theme);
