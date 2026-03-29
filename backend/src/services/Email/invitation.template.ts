import { baseLayout } from './layout';

export function invitationTemplate(workspaceName: string, passKey: string, inviterName: string): string {
  const content = `
    <h2 style="color: #ffffff; margin-bottom: 24px;">Tactical Node Invitation</h2>
    <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">Operative <strong>${inviterName}</strong> has authorized your access to a new tactical environment.</p>
    
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin: 32px 0; text-align: center;">
      <p style="color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Target Node</p>
      <h3 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1px;">${workspaceName}</h3>
      
      <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 24px auto; width: 40px;"></div>
      
      <p style="color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Authorization Code</p>
      <code style="color: #10b981; font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 4px;">${passKey}</code>
    </div>

    <div style="margin: 32px 0;">
      <p style="color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Joining Sequence:</p>
      <ol style="color: #a1a1aa; font-size: 13px; line-height: 1.8; padding-left: 20px;">
        <li>Log in to your <strong>odoo CRM</strong> portal at the link below.</li>
        <li>Access the <strong>Global Network</strong> or <strong>Workspaces</strong> dashboard.</li>
        <li>Select <strong>"Join Workspace"</strong> or <strong>"Connect New Node"</strong>.</li>
        <li>Enter the <strong>Authorization Code</strong> displayed above to initialize your uplink.</li>
      </ol>
    </div>

    <div class="button-container" style="margin-top: 32px;">
      <a href="https://developertesting.duckdns.org" class="button" style="background: #ffffff; color: #000000; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 16px 32px; border-radius: 12px; text-decoration: none; display: inline-block;">Initialize Uplink</a>
    </div>

    <p style="color: #71717a; font-size: 12px; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); pt-24">If you did not expect this authorization, please disregard this transmission.</p>
  `;
  return baseLayout(`Invitation to ${workspaceName}`, content);
}
