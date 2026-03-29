import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { otpTemplate } from './Email/otp.template';
import { welcomeTemplate } from './Email/welcome.template';
import { passwordChangeTemplate } from './Email/password-change.template';

// Load environment variables from .env file
dotenv.config();

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'live.smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_TOKKEN, // Matching .env typo
  },
});

/**
 * Generic helper to send emails.
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  textFallback: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Monkframe CRM" <noreply@monkframer.online>`,
      to,
      subject,
      text: textFallback,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email [${subject}] sent:`, info.messageId);
    return true;
  } catch (error: unknown) {
    console.error(`❌ Error sending email [${subject}]:`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Sends a professional OTP email.
 */
export async function sendOTPEmail(userEmail: string, otp: string | number): Promise<boolean> {
  const html = otpTemplate(otp);
  return sendEmail(
    userEmail,
    'Your Authentication Code | Monkframe',
    html,
    `Your Monkframe verification code is ${otp}`
  );
}

/**
 * Sends a welcome email to new users.
 */
export async function sendWelcomeEmail(userEmail: string, name: string): Promise<boolean> {
  const html = welcomeTemplate(name);
  return sendEmail(
    userEmail,
    `Welcome to the Future, ${name}! | Monkframe`,
    html,
    `Welcome to Monkframe CRM, ${name}! We're thrilled to have you on board.`
  );
}

/**
 * Sends a password reset notification after success.
 */
export async function sendPasswordResetSuccessEmail(userEmail: string): Promise<boolean> {
  const html = passwordChangeTemplate();
  return sendEmail(
    userEmail,
    'Password Reset Successful | Monkframe',
    html,
    'Your password has been reset successfully. You can now log in with your new password.'
  );
}

/**
 * Sends an OTP for password reset.
 */
export async function sendForgotPasswordOTPEmail(userEmail: string, otp: string | number): Promise<boolean> {
  const html = otpTemplate(otp, true);
  return sendEmail(
    userEmail,
    'Password Reset OTP | Monkframe',
    html,
    `Your password reset verification code is ${otp}`
  );
}

export default {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetSuccessEmail,
  sendForgotPasswordOTPEmail,
};

