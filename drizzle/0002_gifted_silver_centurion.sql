CREATE TABLE `published_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creationId` int,
	`platform` varchar(50) NOT NULL,
	`platformPostId` varchar(255),
	`title` text,
	`description` text,
	`mediaUrl` text,
	`status` varchar(50) NOT NULL DEFAULT 'published',
	`engagementMetrics` text,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `published_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`platformUserId` varchar(255) NOT NULL,
	`platformUsername` varchar(255),
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`isConnected` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_media_accounts_id` PRIMARY KEY(`id`)
);
