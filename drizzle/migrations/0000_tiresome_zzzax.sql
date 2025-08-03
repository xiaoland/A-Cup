CREATE TABLE `dns_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`action` text,
	`server` integer NOT NULL,
	`domains` text,
	`domain_suffixes` text,
	`domain_keywords` text,
	`rule_sets` text,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`server`) REFERENCES `dns_servers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dns_servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`address` text NOT NULL,
	`port` integer,
	`outbound_detour` integer,
	`wg_endpoint_detour` integer,
	`tls` text,
	`https` text,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outbound_detour`) REFERENCES `outbounds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wg_endpoint_detour`) REFERENCES `endpoint_wireguards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `endpoint_wireguards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`system` integer DEFAULT false NOT NULL,
	`addresses` text NOT NULL,
	`private_key` text NOT NULL,
	`public_key` text NOT NULL,
	`preshared_key` text,
	`peers` text DEFAULT '[]' NOT NULL,
	`mtu` integer DEFAULT 1408,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inbounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`type` text NOT NULL,
	`address` text,
	`port` integer,
	`stack` text DEFAULT 'mixed',
	`mtu` integer DEFAULT 9000,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `outbounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`name` text,
	`type` text NOT NULL,
	`outbounds` text,
	`region` text,
	`address` text,
	`port` integer,
	`network` text,
	`encryption` text,
	`packet_encoding` text,
	`uuid` text,
	`password` text,
	`alter_id` integer,
	`flow` text,
	`transport` text,
	`tls` text,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_by` integer NOT NULL,
	`name` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`inbounds` text DEFAULT '[]' NOT NULL,
	`outbounds` text DEFAULT '[]' NOT NULL,
	`route_final` integer,
	`wg_endpoints` text DEFAULT '[]' NOT NULL,
	`rules` text DEFAULT '[]' NOT NULL,
	`rule_sets` text DEFAULT '[]' NOT NULL,
	`dns_rules` text DEFAULT '[]' NOT NULL,
	`dns` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`route_final`) REFERENCES `outbounds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `route_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`action` text NOT NULL,
	`outbound` integer,
	`domains` text,
	`domain_suffixes` text,
	`domain_keywords` text,
	`domain_regexes` text,
	`rule_sets` text,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outbound`) REFERENCES `outbounds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rule_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`share` integer DEFAULT false NOT NULL,
	`type` text DEFAULT 'remote' NOT NULL,
	`name` text NOT NULL,
	`rules` text,
	`url` text,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`roles` text DEFAULT '[]' NOT NULL
);
