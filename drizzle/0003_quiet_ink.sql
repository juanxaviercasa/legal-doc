CREATE TABLE `legal_change_candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`externalIdentifier` varchar(255),
	`title` varchar(512) NOT NULL,
	`sourceUrl` varchar(2048) NOT NULL,
	`changeType` enum('new_publication','modification','repeal','correction','unknown') NOT NULL DEFAULT 'unknown',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`contentHash` varchar(128),
	`status` enum('pending_review','approved','rejected','ignored') NOT NULL DEFAULT 'pending_review',
	`notes` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_change_candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_citations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`generatedDocumentId` int,
	`instrumentVersionId` int NOT NULL,
	`articleReference` varchar(255),
	`quotedExcerpt` text,
	`citationLabel` varchar(512) NOT NULL,
	`sourceUrl` varchar(2048) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_citations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_instrument_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instrumentId` int NOT NULL,
	`versionLabel` varchar(255) NOT NULL,
	`officialPublicationDate` date,
	`versionAsOf` date NOT NULL,
	`legalStatus` enum('vigente','modificado','derogado_parcial','derogado','pendiente_verificacion') NOT NULL DEFAULT 'pendiente_verificacion',
	`approvalStatus` enum('draft','pending_review','approved','rejected','superseded') NOT NULL DEFAULT 'draft',
	`sourceUrl` varchar(2048) NOT NULL,
	`sourceFileKey` varchar(512),
	`contentMarkdown` longtext NOT NULL,
	`checksum` varchar(128) NOT NULL,
	`changeSummary` text,
	`importedByUserId` int,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_instrument_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_instruments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdictionId` varchar(32) NOT NULL DEFAULT 'pe',
	`sourceId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`normIdentifier` varchar(255),
	`documentType` varchar(128) NOT NULL,
	`subject` varchar(255),
	`description` text,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_instruments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdictionId` varchar(32) NOT NULL DEFAULT 'pe',
	`name` varchar(255) NOT NULL,
	`authority` varchar(255) NOT NULL,
	`sourceType` enum('official_publication','official_consolidated','official_archive','validated_upload') NOT NULL,
	`baseUrl` varchar(1024) NOT NULL,
	`updateMethod` enum('manual','public_page_check','authorized_api') NOT NULL DEFAULT 'manual',
	`isOfficial` boolean NOT NULL DEFAULT true,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`lastCheckedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_sources_id` PRIMARY KEY(`id`)
);
