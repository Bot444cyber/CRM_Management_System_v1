import { baseLayout } from './layout';

export function welcomeTemplate(name: string): string {
  const content = `
    <h2>Welcome to odoo, ${name}!</h2>
    <p>We're thrilled to have you join our intelligent CRM ecosystem. odoo is built to streamline your workflow and help you manage workspaces with precision.</p>
    
    <p>Get started by exploring your Website:</p>
    <ul>
      <li>Create your first <strong>System</strong></li>
      <li>Invite team members to <strong>collaborate</strong></li>
      <li>Set up business and <strong>track progress</strong></li>
    </ul>

    <div class="button-container">
      <a href="https://developertesting.duckdns.org" class="button">Go to Website</a>
    </div>

    <p>If you have any questions, our support team is just a reply away.</p>
    <p>Best regards,<br>The odoo Team</p>
  `;
  return baseLayout('Welcome to odoo', content);
}

