PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rule_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`readable_by` text DEFAULT '[]' NOT NULL,
	`writeable_by` text DEFAULT '[]' NOT NULL,
	`tag` text NOT NULL,
	`type` text NOT NULL,
	`format` text,
	`content` text NOT NULL,
	`download_detour` integer NOT NULL,
	`update_interval` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_rule_sets`("id", "readable_by", "writeable_by", "tag", "type", "format", "content", "download_detour", "update_interval") SELECT "id", "readable_by", "writeable_by", "tag", "type", "format", "content", "download_detour", "update_interval" FROM `rule_sets`;--> statement-breakpoint
DROP TABLE `rule_sets`;--> statement-breakpoint
ALTER TABLE `__new_rule_sets` RENAME TO `rule_sets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;