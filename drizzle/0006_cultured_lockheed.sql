CREATE TABLE `matter_procedural_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`eventType` enum('filing','hearing','deadline','notification','status_update','other') NOT NULL,
	`eventAt` timestamp NOT NULL,
	`isDeadline` boolean NOT NULL DEFAULT false,
	`sourceType` enum('manual','official_notification','party_communication','other') NOT NULL DEFAULT 'manual',
	`sourceReference` varchar(512),
	`sourceUrl` varchar(2048),
	`verificationStatus` enum('pending_confirmation','confirmed','superseded') NOT NULL DEFAULT 'pending_confirmation',
	`notes` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matter_procedural_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matter_procedural_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`caseNumber` varchar(128),
	`authority` varchar(255),
	`venue` varchar(255),
	`procedureType` varchar(128),
	`proceduralStage` varchar(128),
	`sourceReference` varchar(512),
	`sourceUrl` varchar(2048),
	`verificationStatus` enum('pending_confirmation','confirmed','superseded') NOT NULL DEFAULT 'pending_confirmation',
	`lastVerifiedAt` timestamp,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matter_procedural_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `matter_procedural_profiles_matterId_unique` UNIQUE(`matterId`)
);
