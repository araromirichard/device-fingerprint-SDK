CREATE TABLE organizations (
    org_id TEXT PRIMARY KEY,
    usage_count INTEGER DEFAULT 0,
    advance BOOLEAN DEFAULT false
);
