CREATE TABLE `counseling_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientKana` varchar(255),
	`clientDob` varchar(20),
	`clientJob` varchar(255),
	`clientAddress` varchar(500),
	`clientTel` varchar(50),
	`clientMobile` varchar(50),
	`ectoScore` int NOT NULL DEFAULT 0,
	`mesoScore` int NOT NULL DEFAULT 0,
	`endoScore` int NOT NULL DEFAULT 0,
	`primaryType` enum('ecto','meso','endo','unknown') NOT NULL DEFAULT 'unknown',
	`ectoChecked` json,
	`mesoChecked` json,
	`endoChecked` json,
	`symptoms` json,
	`hairChildType` varchar(50),
	`hairTroubles` json,
	`colorHistory` varchar(500),
	`hasMedication` boolean DEFAULT false,
	`medicationDetail` text,
	`hasPollen` boolean DEFAULT false,
	`pollenTypes` json,
	`lifestyleHabits` json,
	`foodNotes` text,
	`hasIllness` boolean DEFAULT false,
	`illnessDetail` text,
	`visitReason` varchar(100),
	`request` text,
	`accessChannel` enum('store','sns','line','web','other') NOT NULL DEFAULT 'other',
	`partnerSalonId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `counseling_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partner_salons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`passcode` varchar(32) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_salons_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_salons_passcode_unique` UNIQUE(`passcode`)
);
--> statement-breakpoint
CREATE TABLE `passcodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`type` enum('general','partner','admin') NOT NULL,
	`partnerSalonId` int,
	`label` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passcodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `passcodes_code_unique` UNIQUE(`code`)
);
