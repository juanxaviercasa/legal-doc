CREATE TABLE `legal_matters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`jurisdictionId` varchar(32) NOT NULL DEFAULT 'pe',
	`title` varchar(255) NOT NULL,
	`referenceCode` varchar(64),
	`matterType` varchar(128),
	`clientName` varchar(255),
	`clientEmail` varchar(320),
	`clientPhone` varchar(64),
	`description` text,
	`facts` longtext,
	`objective` text,
	`nextAction` varchar(512),
	`status` enum('intake','active','waiting_client','on_hold','closed') NOT NULL DEFAULT 'intake',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_matters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matter_parties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(128) NOT NULL,
	`documentType` varchar(64),
	`documentNumber` varchar(64),
	`email` varchar(320),
	`phone` varchar(64),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matter_parties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matter_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text,
	`dueAt` timestamp,
	`status` enum('open','in_progress','done','cancelled') NOT NULL DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matter_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matter_timeline_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`createdByUserId` int,
	`eventType` enum('note','task_created','task_completed','document_linked','matter_created') NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matter_timeline_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generated_documents` ADD `matterId` int;