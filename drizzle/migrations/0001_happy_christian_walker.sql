CREATE TABLE `outbounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`readable_by` text NOT NULL,
	`writeable_by` text NOT NULL,
	`name` text NOT NULL,
	`region` text NOT NULL,
	`provider` text NOT NULL,
	`type` text NOT NULL,
	`server` text NOT NULL,
	`server_port` integer NOT NULL,
	`credential` text NOT NULL,
	`tls` text,
	`mux` text,
	`other` text
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tags` text NOT NULL,
	`created_by` text NOT NULL,
	`outbounds` text NOT NULL,
	`rule_sets` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rule_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`readable_by` text NOT NULL,
	`writeable_by` text NOT NULL,
	`tag` text NOT NULL,
	`type` text NOT NULL,
	`format` text,
	`content` text NOT NULL,
	`download_detour` integer,
	`update_interval` integer
);
