CREATE TABLE `creations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('image','video','upscale','tts','flow') NOT NULL,
	`prompt` text NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`s3Url` varchar(2048) NOT NULL,
	`mimeType` varchar(64),
	`tokensUsed` int NOT NULL,
	`metadata` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokenBalances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 1000,
	`totalAllocated` int NOT NULL DEFAULT 1000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tokenBalances_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokenBalances_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `tokenTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('image_generation','video_generation','upscale','tts','initial_allocation','purchase') NOT NULL,
	`creationId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenTransactions_id` PRIMARY KEY(`id`)
);
