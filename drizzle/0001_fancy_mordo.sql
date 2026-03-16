CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`date` varchar(10) NOT NULL,
	`time` varchar(5) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`item` varchar(255) NOT NULL,
	`totalValue` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`entryValue` decimal(10,2) NOT NULL DEFAULT '0',
	`installments` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`side` enum('noiva','noivo') NOT NULL,
	`role` varchar(50) NOT NULL,
	`confirmed` boolean NOT NULL DEFAULT false,
	`present` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weddingId` int NOT NULL,
	`text` text NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`brideName` varchar(255) NOT NULL,
	`groomName` varchar(255) NOT NULL,
	`weddingDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weddings_id` PRIMARY KEY(`id`)
);
