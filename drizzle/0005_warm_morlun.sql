CREATE TABLE `matter_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL DEFAULT 'editor',
	`assignedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matter_assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `matter_assignments_matter_user_unique` UNIQUE(`matterId`,`userId`)
);
