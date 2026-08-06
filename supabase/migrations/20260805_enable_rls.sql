-- Enable Row Level Security (RLS) on all public tables
-- This ensures that anonymous and authenticated clients cannot access or modify these tables.
-- The API backend uses the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS policies entirely,
-- so API functionality will remain unaffected.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
