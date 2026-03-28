CREATE TABLE `chat_channels` (
	`id` varchar(255) NOT NULL,
	`workspace_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) DEFAULT 'public',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chat_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` varchar(255) NOT NULL,
	`channel_id` varchar(255) NOT NULL,
	`sender_id` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
