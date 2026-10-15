CREATE TABLE `designs` (
	`id` text PRIMARY KEY NOT NULL,
	`theme` text NOT NULL,
	`font` text NOT NULL,
	`prompt` text NOT NULL,
	`cursor` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`views` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `designs_combo` ON `designs` (`theme`,`font`,`prompt`,`cursor`,`size`);