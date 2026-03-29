import { baseLayout } from './layout';

export function otpTemplate(otp: string | number, isForgotPassword = false): string {
  const title = isForgotPassword ? 'Reset Your Password' : 'Verify Your Account';
  const subtitle = isForgotPassword
    ? 'Use the code below to complete your password reset process.'
    : 'Please enter the following 6-digit code to verify your identity and access your odoo account.';

  const content = `
    <h2>${title}</h2>
    <p>${subtitle}</p>
    
    <div class="code-box">
      ${otp}
    </div>

    <p>This code will expire in 10 minutes. For your security, please do not share this code with anyone.</p>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #71717a;">If you did not request this code, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
  `;
  return baseLayout(title, content);
}

