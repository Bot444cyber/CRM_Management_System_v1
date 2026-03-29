import { baseLayout } from './layout';

export function invitationTemplate(workspaceName: string, passKey: string, inviterName: string): string {
  const content = `
    <h2>Tactical Node Invitation</h2>
    <p>Operative <strong>${inviterName}</strong> has authorized your access to a new tactical environment.</p>
    
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #27272a; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
      <span class="label">Target Node</span>
      <h3 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: -1px;">${workspaceName}</h3>
      
      <div style="height: 1px; background: #27272a; margin: 24px auto; width: 40px;"></div>
      
      <span class="label">Authorization Code</span>
      <div class="code-box" style="margin: 0; border: none; background: none; padding: 0;">
        ${passKey}
      </div>
    </div>

    <div style="margin: 32px 0;">
      <p style="color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Joining Sequence:</p>
      <ol style="color: #a1a1aa; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
        <li>Log in to your <strong>odoo CRM</strong> portal.</li>
        <li>Access the <strong>Global Network</strong> or <strong>Workspaces</strong> dashboard.</li>
        <li>Select <strong>"Join Workspace"</strong> or <strong>"Connect New Node"</strong>.</li>
        <li>Enter the <strong>Authorization Code</strong> displayed above to initialize your uplink.</li>
      </ol>
    </div>

    <div class="button-container">
      <a href="https://developertesting.duckdns.org" class="button">Initialize Uplink</a>
    </div>

    <p style="color: #52525b; font-size: 12px; margin-top: 40px; border-top: 1px solid #1e1e21; padding-top: 24px;">If you did not expect this authorization, please disregard this transmission.</p>
  `;
  return baseLayout(`Invitation to ${workspaceName}`, content);
}
