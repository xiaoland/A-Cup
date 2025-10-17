CREATE TABLE `outbounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`region` text,
	`provider` text,
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
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` integer NOT NULL,
	`name` text NOT NULL,
	`uuid` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`outbounds` text DEFAULT '[]' NOT NULL,
	`rule_sets` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rule_sets` (
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
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
