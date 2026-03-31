CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`action_type` varchar(255) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`entity_details` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `analytics` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`value` int NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);

CREATE TABLE `chat_channel_members` (
	`id` varchar(255) NOT NULL,
	`channel_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`last_read_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`joined_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chat_channel_members_id` PRIMARY KEY(`id`)
);

CREATE TABLE `chat_channels` (
	`id` varchar(255) NOT NULL,
	`workspace_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) DEFAULT 'public',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chat_channels_id` PRIMARY KEY(`id`)
);

CREATE TABLE `chat_messages` (
	`id` varchar(255) NOT NULL,
	`channel_id` varchar(255) NOT NULL,
	`sender_id` int NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);

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

CREATE TABLE `oauth_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` varchar(50) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `oauth_accounts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_inventory` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`inventory_id` varchar(255) NOT NULL,
	`sub_product_name` varchar(255) NOT NULL,
	`required_quantity` int NOT NULL DEFAULT 1,
	`reserved_quantity` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `project_inventory_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_invitations` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`code` varchar(10) NOT NULL,
	`link_token` varchar(255) NOT NULL,
	`methods` json DEFAULT ('["code","link","approval"]'),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `project_invitations_code_unique` UNIQUE(`code`),
	CONSTRAINT `project_invitations_link_token_unique` UNIQUE(`link_token`)
);

CREATE TABLE `project_join_requests` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`status` varchar(50) DEFAULT 'Pending',
	`message` text,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`processed_at` timestamp,
	CONSTRAINT `project_join_requests_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_members` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'developer',
	`joined_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_milestones` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(50) DEFAULT 'Pending',
	`due_date` timestamp,
	`progress` int DEFAULT 0,
	`assigned_to` int,
	`priority` varchar(50) DEFAULT 'Medium',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `project_milestones_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_pulse` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`time` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `project_pulse_id` PRIMARY KEY(`id`)
);

CREATE TABLE `project_reminders` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`due_date` timestamp,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `project_reminders_id` PRIMARY KEY(`id`)
);

CREATE TABLE `projects` (
	`id` varchar(255) NOT NULL,
	`workspace_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(50) DEFAULT 'Active',
	`deadline` timestamp,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

CREATE TABLE `resource_requests` (
	`id` varchar(255) NOT NULL,
	`project_id` varchar(255) NOT NULL,
	`inventory_id` varchar(255) NOT NULL,
	`sub_product_name` varchar(255) NOT NULL,
	`requested_quantity` int NOT NULL DEFAULT 1,
	`requested_by_user_id` int NOT NULL,
	`status` varchar(50) DEFAULT 'Pending',
	`pulse_event_id` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`processed_at` timestamp,
	CONSTRAINT `resource_requests_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`is_verified` boolean DEFAULT false,
	`is_two_factor_enabled` boolean DEFAULT false,
	`role` varchar(50) DEFAULT 'user',
	`green_api_instance_id` varchar(255),
	`green_api_token` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`last_active` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

CREATE TABLE `verification_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `verification_tokens_id` PRIMARY KEY(`id`)
);

CREATE TABLE `workspace_members` (
	`id` varchar(255) NOT NULL,
	`workspace_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'member',
	`joined_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `workspace_members_id` PRIMARY KEY(`id`)
);

CREATE TABLE `workspaces` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`pass_key` varchar(10),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_pass_key_unique` UNIQUE(`pass_key`)
);
