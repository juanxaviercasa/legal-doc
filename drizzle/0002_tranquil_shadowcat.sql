CREATE TABLE `usage_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`jurisdictionId` varchar(32) NOT NULL DEFAULT 'pe',
	`templateId` varchar(64),
	`eventType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generated_documents` ADD `jurisdictionId` varchar(32) DEFAULT 'pe' NOT NULL;