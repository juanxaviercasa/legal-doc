CREATE TABLE `matter_legal_research` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matterId` int NOT NULL,
	`instrumentVersionId` int NOT NULL,
	`citationLabel` varchar(512) NOT NULL,
	`sourceUrl` varchar(2048) NOT NULL,
	`articleReference` varchar(255),
	`note` text,
	`addedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matter_legal_research_id` PRIMARY KEY(`id`),
	CONSTRAINT `matter_legal_research_matter_version_unique` UNIQUE(`matterId`,`instrumentVersionId`)
);
