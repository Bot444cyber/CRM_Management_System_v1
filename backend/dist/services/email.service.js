"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = sendOTPEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPasswordResetSuccessEmail = sendPasswordResetSuccessEmail;
exports.sendForgotPasswordOTPEmail = sendForgotPasswordOTPEmail;
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const template_utils_1 = require("../utils/template.utils");
// Load environment variables from .env file
dotenv_1.default.config();
// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer_1.default.createTransport({
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
async function sendEmail(to, subject, templateName, templateData, textFallback) {
    try {
        const html = (0, template_utils_1.getTemplate)(templateName, templateData);
        const mailOptions = {
            from: `"Nexus Inventory | SAAS" <noreply@monkframer.online>`,
            to,
            subject,
            text: textFallback,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email [${templateName}] sent:`, info.messageId);
        return true;
    }
    catch (error) {
        console.error(`❌ Error sending email [${templateName}]:`, error instanceof Error ? error.message : error);
        return false;
    }
}
/**
 * Sends a professional OTP email.
 */
async function sendOTPEmail(userEmail, otp) {
    return sendEmail(userEmail, 'Your Authentication Code | Nexus', 'otp.html', { otp }, `Your Nexus Inventory verification code is ${otp}`);
}
/**
 * Sends a welcome email to new users.
 */
async function sendWelcomeEmail(userEmail, name) {
    const loginUrl = process.env.FRONTEND_URL || 'https://nexus-inventory.com/login';
    return sendEmail(userEmail, `Welcome to the Future, ${name}! | Nexus`, 'welcome.html', { name, loginUrl }, `Welcome to Nexus Inventory, ${name}! We're thrilled to have you on board.`);
}
/**
 * Sends a password reset notification after success.
 */
async function sendPasswordResetSuccessEmail(userEmail) {
    const loginUrl = `${process.env.FRONTEND_URL || 'https://nexus-inventory.com'}/login`;
    return sendEmail(userEmail, 'Password Reset Successful | Nexus', 'reset-password.html', { loginUrl }, 'Your password has been reset successfully. You can now log in with your new password.');
}
/**
 * Sends an OTP for password reset.
 */
async function sendForgotPasswordOTPEmail(userEmail, otp) {
    return sendEmail(userEmail, 'Password Reset OTP | Nexus', 'otp.html', { otp }, `Your password reset verification code is ${otp}`);
}
exports.default = {
    sendOTPEmail,
    sendWelcomeEmail,
    sendPasswordResetSuccessEmail,
    sendForgotPasswordOTPEmail
};
