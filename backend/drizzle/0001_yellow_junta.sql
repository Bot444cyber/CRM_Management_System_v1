CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`action_type` varchar(255) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`entity_details` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`value` int NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL DEFAULT 0,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`location` varchar(255),
	`orders` int DEFAULT 0,
	`spent` varchar(50) DEFAULT '$ 0',
	`rating` decimal(3,1),
	`avatar` varchar(10),
	`purchased_products` json DEFAULT ('[]'),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventories` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`image_url` varchar(2048),
	`main_products` json,
	`main_product` varchar(255) NOT NULL DEFAULT '',
	`main_product_image_url` varchar(2048),
	`sub_products` json NOT NULL DEFAULT ('[]'),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inventories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`time` varchar(50),
	`icon` varchar(255),
	`color` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified` boolean DEFAULT false;