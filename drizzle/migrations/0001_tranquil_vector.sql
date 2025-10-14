DROP TABLE `dns_rules`;--> statement-breakpoint
DROP TABLE `dns_servers`;--> statement-breakpoint
DROP TABLE `endpoint_wireguards`;--> statement-breakpoint
DROP TABLE `inbounds`;--> statement-breakpoint
DROP TABLE `route_rules`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_outbounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`region` text,
	`provider` text,
	`tag` text,
	`type` text NOT NULL,
	`server` text NOT NULL,
	`server_port` integer NOT NULL,
	`credential` text NOT NULL,
	`transport` text DEFAULT '{}',
	`tls` text DEFAULT '{}',
	`mux` text DEFAULT '{}',
	`other` text DEFAULT '{}',
	`readable_by` text DEFAULT '[]',
	`writable_by` text DEFAULT '[]',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_outbounds`("id", "name", "region", "provider", "tag", "type", "server", "server_port", "credential", "transport", "tls", "mux", "other", "readable_by", "writable_by", "created_at", "updated_at") SELECT "id", "name", "region", "provider", "tag", "type", "server", "server_port", "credential", "transport", "tls", "mux", "other", "readable_by", "writable_by", "created_at", "updated_at" FROM `outbounds`;--> statement-breakpoint
DROP TABLE `outbounds`;--> statement-breakpoint
ALTER TABLE `__new_outbounds` RENAME TO `outbounds`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` integer NOT NULL,
	`name` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`outbounds` text DEFAULT '[]' NOT NULL,
	`rule_sets` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "created_by", "name", "tags", "outbounds", "rule_sets") SELECT "id", "created_by", "name", "tags", "outbounds", "rule_sets" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
CREATE TABLE `__new_rule_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`format` text NOT NULL,
	`content` text NOT NULL,
	`readable_by` text NOT NULL,
	`writeable_by` text NOT NULL,
	`download_detour` text,
	`update_interval` text
);
--> statement-breakpoint
INSERT INTO `__new_rule_sets`("id", "name", "type", "format", "content", "readable_by", "writeable_by", "download_detour", "update_interval") SELECT "id", "name", "type", "format", "content", "readable_by", "writeable_by", "download_detour", "update_interval" FROM `rule_sets`;--> statement-breakpoint
DROP TABLE `rule_sets`;--> statement-breakpoint
ALTER TABLE `__new_rule_sets` RENAME TO `rule_sets`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `roles`;