CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`search_id` text NOT NULL,
	`query` text NOT NULL,
	`vinted_url` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `searches` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`query` text NOT NULL,
	`source_url` text,
	`image_key` text,
	`intent` text DEFAULT 'exact' NOT NULL,
	`analysis_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL
);
