import { baseLayout } from './layout';

export function welcomeTemplate(name: string): string {
  const content = `
    <h2>Welcome to odoo, ${name}!</h2>
    <p>We're thrilled to have you join our intelligent CRM ecosystem. odoo is built to streamline your workflow and help you manage workspaces with precision.</p>
    
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Get started:</p>
      <ul style="color: #a1a1aa; font-size: 14px; padding-left: 20px; line-height: 1.8;">
        <li>Create your first <strong>System</strong></li>
        <li>Invite team members to <strong>collaborate</strong></li>
        <li>Set up business and <strong>track progress</strong></li>
      </ul>
    </div>

    <div class="button-container">
      <a href="https://developertesting.duckdns.org" class="button">Go to Website</a>
    </div>

    <p>If you have any questions, our support team is just a reply away.</p>
    <p>Best regards,<br>The <strong>odoo</strong> Team</p>
  `;
  return baseLayout('Welcome to odoo', content);
}
