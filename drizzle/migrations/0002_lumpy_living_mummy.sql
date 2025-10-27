PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_outbounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`readable_by` text DEFAULT '[]' NOT NULL,
	`writeable_by` text DEFAULT '[]' NOT NULL,
	`name` text NOT NULL,
	`region` text NOT NULL,
	`provider` text NOT NULL,
	`type` text NOT NULL,
	`server` text NOT NULL,
	`server_port` integer NOT NULL,
	`credential` text DEFAULT '{}' NOT NULL,
	`tls` text DEFAULT '{}' NOT NULL,
	`mux` text DEFAULT '{}' NOT NULL,
	`other` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_outbounds`("id", "readable_by", "writeable_by", "name", "region", "provider", "type", "server", "server_port", "credential", "tls", "mux", "other") SELECT "id", "readable_by", "writeable_by", "name", "region", "provider", "type", "server", "server_port", "credential", "tls", "mux", "other" FROM `outbounds`;--> statement-breakpoint
DROP TABLE `outbounds`;--> statement-breakpoint
ALTER TABLE `__new_outbounds` RENAME TO `outbounds`;--> statement-breakpoint
PRAGMA foreign_keys=ON;