import fs from 'fs';
import path from 'path';

/**
 * Reads an HTML template and replaces placeholders with provided data.
 * @param templateName Name of the template file (e.g., 'otp.html')
 * @param data Object containing keys to replace in the format {{key}}
 * @returns string containing the processed HTML
 */
export function getTemplate(templateName: string, data: Record<string, string | number>): string {
    try {
        // Correctly navigate from src/utils to src/services/Email
        const templatePath = path.join(__dirname, '..', 'services', 'Email', templateName);
        let htmlContent = fs.readFileSync(templatePath, 'utf-8');

        // Add current year to data if not provided
        if (!data.year) {
            data.year = new Date().getFullYear();
        }

        // Replace all placeholders
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            htmlContent = htmlContent.replace(regex, String(value));
        });

        return htmlContent;
    } catch (error) {
        console.error(`❌ Error reading template ${templateName}:`, error);
        throw new Error(`Could not load email template: ${templateName}`);
    }
}
