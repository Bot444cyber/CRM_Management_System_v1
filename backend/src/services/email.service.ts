import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { getTemplate } from '../utils/template.utils';

// Load environment variables from .env file
dotenv.config();

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_TOKKEN,
  },
});

/**
 * Generic helper to send emails using templates.
 */
async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  templateData: Record<string, string | number>,
  textFallback: string
): Promise<boolean> {
  try {
    const html = getTemplate(templateName, templateData);

    const mailOptions = {
      from: `"Nexus Inventory" | SAAS" <noreply@monkframer.online>`,
      to,
      subject,
      text: textFallback,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email [${templateName}] sent:`, info.messageId);
    return true;
  } catch (error: unknown) {
    console.error(`❌ Error sending email [${templateName}]:`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Sends a professional OTP email.
 */
export async function sendOTPEmail(userEmail: string, otp: string | number): Promise<boolean> {
  return sendEmail(
    userEmail,
    'Your Authentication Code | Nexus',
    'otp.html',
    { otp },
    `Your Nexus Inventory verification code is ${otp}`
  );
}

/**
 * Sends a welcome email to new users.
 */
export async function sendWelcomeEmail(userEmail: string, name: string): Promise<boolean> {
  const loginUrl = process.env.FRONTEND_URL || 'https://nexus-inventory.com/login';
  return sendEmail(
    userEmail,
    `Welcome to the Future, ${name}! | Nexus`,
    'welcome.html',
    { name, loginUrl },
    `Welcome to Nexus Inventory, ${name}! We're thrilled to have you on board.`
  );
}

/**
 * Sends a password reset notification after success.
 */
export async function sendPasswordResetSuccessEmail(userEmail: string): Promise<boolean> {
  const loginUrl = `${process.env.FRONTEND_URL || 'https://nexus-inventory.com'}/login`;
  return sendEmail(
    userEmail,
    'Password Reset Successful | Nexus',
    'reset-password.html',
    { loginUrl },
    'Your password has been reset successfully. You can now log in with your new password.'
  );
}

/**
 * Sends an OTP for password reset.
 */
export async function sendForgotPasswordOTPEmail(userEmail: string, otp: string | number): Promise<boolean> {
  return sendEmail(
    userEmail,
    'Password Reset OTP | Nexus',
    'otp.html',
    { otp },
    `Your password reset verification code is ${otp}`
  );
}

export default {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetSuccessEmail,
  sendForgotPasswordOTPEmail
};
