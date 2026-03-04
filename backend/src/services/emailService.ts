import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTP = async (to: string, otp: string) => {
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
