CREATE TABLE IF NOT EXISTS device_fingerprints (
    org_id TEXT,
    device_hash TEXT,
    created_at INTEGER,
    PRIMARY KEY (org_id, device_hash)
);
