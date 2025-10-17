
-- SQLite: Disable foreign key checks temporarily
PRAGMA foreign_keys = OFF;

-- Drop all tables
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS dns_rules;
DROP TABLE IF EXISTS dns_servers;
DROP TABLE IF EXISTS endpoint_wireguards;
DROP TABLE IF EXISTS rule_sets;
DROP TABLE IF EXISTS route_rules;
DROP TABLE IF EXISTS outbounds;
DROP TABLE IF EXISTS inbounds;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;