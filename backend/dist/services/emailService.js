"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendOTP = async (to, otp) => {
    console.log("OTP", otp);
    /*
        try {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Nexus Auth" <noreply@nexus.com>',
                to,
                subject: "Your Two-Factor Authentication OTP",
                text: `Your Nexus OTP code is: ${otp}. It expires in 5 minutes.`,
                html: `<b>Your Nexus OTP code is:</b> <br/><br/><h2>${otp}</h2><br/>It expires in 5 minutes.`,
            });
    
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return info;
        } catch (error) {
            console.error("Error sending OTP email", error);
            throw error;
        }
    */
};
exports.sendOTP = sendOTP;
