CREATE TABLE organizations (
    org_id TEXT PRIMARY KEY,
    usage_count INTEGER DEFAULT 0,
    advance BOOLEAN DEFAULT false
);

CREATE TABLE device_fingerprints (
    org_id TEXT,
    device_hash TEXT,
    created_at INTEGER,
    PRIMARY KEY (org_id, device_hash)
);
