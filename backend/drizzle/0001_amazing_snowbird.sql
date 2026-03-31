ALTER TABLE `project_milestones` ADD `tags` json DEFAULT ('[]');
ALTER TABLE `project_milestones` ADD `estimated_hours` int DEFAULT 0;
ALTER TABLE `project_milestones` ADD `actual_hours` int DEFAULT 0;
ALTER TABLE `project_milestones` ADD `checklists` json DEFAULT ('[]');