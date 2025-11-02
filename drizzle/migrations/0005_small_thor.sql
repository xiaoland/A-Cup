DROP TABLE `users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tags` text NOT NULL,
	`outbounds` text DEFAULT '[]' NOT NULL,
	`rule_sets` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "name", "tags", "outbounds", "rule_sets") SELECT "id", "name", "tags", "outbounds", "rule_sets" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `outbounds` DROP COLUMN `readable_by`;--> statement-breakpoint
ALTER TABLE `outbounds` DROP COLUMN `writeable_by`;--> statement-breakpoint
ALTER TABLE `rule_sets` DROP COLUMN `readable_by`;--> statement-breakpoint
ALTER TABLE `rule_sets` DROP COLUMN `writeable_by`;