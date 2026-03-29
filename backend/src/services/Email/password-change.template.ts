import { baseLayout } from './layout';

export function passwordChangeTemplate(): string {
  const content = `
    <h2>Security Alert</h2>
    <p>This is a confirmation that the password for your <strong>odoo</strong> account has been successfully changed.</p>
    
    <div class="divider"></div>

    <p>Best regards,<br><strong>odoo</strong> Team</p>
  `;
  return baseLayout('Password Changed Successfully', content);
}

