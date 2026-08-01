CREATE TABLE `generated_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` varchar(64) NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`formData` text NOT NULL,
	`generatedContent` text NOT NULL,
	`documentTitle` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generated_documents_id` PRIMARY KEY(`id`)
);
