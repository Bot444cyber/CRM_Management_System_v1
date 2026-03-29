import { Request, Response } from "express";
import { db } from "../config/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../utils/hash";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { z } from "zod";
import EmailService from "../services/email.service";
import { verificationTokens, oauthAccounts } from "../db/schema";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = registerSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }

        const { email, password } = parsedData.data;

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            res.status(400).json({ error: "Email already in use" });
            return;
        }

        // Generate OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        // Delete any existing OTPs for this email to avoid clutter
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

        await db.insert(verificationTokens).values({
            identifier: email,
            token: otp,
            expires,
        });

        await EmailService.sendOTPEmail(email, otp);

        res.status(201).json({
            message: "OTP sent successfully. Please verify your email.",
            requiresVerification: true
        });
    } catch (error) {
        console.error("Registration Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = loginSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }

        const { email, password } = parsedData.data;

        const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = existingUsers[0];

        if (!user || !user.password) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        if (!user.isVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 5 * 60 * 1000);

            await db.delete(verificationTokens).where(eq(verificationTokens.identifier, user.email));
            await db.insert(verificationTokens).values({
                identifier: user.email,
                token: otp,
                expires,
            });
            await EmailService.sendOTPEmail(user.email, otp);

            res.status(403).json({
                error: "Please verify your email",
                requiresVerification: true,
                message: "A new OTP has been sent to your email."
            });
            return;
        }

        if (user.isTwoFactorEnabled) {
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
            const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

            // Delete old OTPs for this user
            await db.delete(verificationTokens).where(eq(verificationTokens.identifier, user.email));

            // Save new OTP
            await db.insert(verificationTokens).values({
                identifier: user.email,
                token: otp,
                expires,
            });

            // Send Email
            await EmailService.sendOTPEmail(user.email, otp);

            res.status(200).json({ message: "2FA required. OTP sent to email.", userId: user.id, isTwoFactorEnabled: true });
            return;
        }

        const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, role: user.role },
            ...tokens,
        });
    } catch (error) {
        console.error("Login Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const verifyOtpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    fullName: z.string().optional(),
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = verifyOtpSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }

        const { email, otp, password, fullName } = parsedData.data;

        const tokens = await db.select().from(verificationTokens).where(eq(verificationTokens.identifier, email));
        const tokenRecord = tokens.find(t => t.token === otp);

        if (!tokenRecord) {
            res.status(400).json({ error: "Invalid OTP" });
            return;
        }

        if (new Date() > tokenRecord.expires) {
            res.status(400).json({ error: "OTP expired" });
            return;
        }

        // OTP is valid, proceed with checking/creating user
        let userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
        let user = userRecords[0];

        if (!user) {
            if (!password) {
                res.status(400).json({ error: "Password is required for registration" });
                return;
            }

            // Create new verified user since OTP is confirmed
            const hashedPassword = await hashPassword(password);
            const [insertResult] = await db.insert(users).values({
                email,
                name: fullName || null,
                password: hashedPassword,
                isVerified: true,
            });

            user = {
                id: insertResult.insertId,
                email,
                name: fullName || null,
                password: hashedPassword,
                isVerified: true,
                isTwoFactorEnabled: false,
                role: "user",
                greenApiInstanceId: null,
                greenApiToken: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastActive: new Date()
            };
        } else if (!user.isVerified) {
            await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
            user.isVerified = true;
        }

        // Delete token after successful use
        await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRecord.id));

        const jwtTokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

        // Send Welcome Email if it's a new registration
        if (password && fullName) {
            await EmailService.sendWelcomeEmail(email, fullName);
        }

        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, role: user.role },
            ...jwtTokens,
        });

    } catch (error) {
        console.error("OTP Verification Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const enable2FA = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await db.update(users).set({ isTwoFactorEnabled: true }).where(eq(users.id, userId));
        res.json({ message: "Two-Step Verification enabled successfully" });
    } catch (error) {
        console.error("Enable 2FA Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const googleOAuthSchema = z.object({
    token: z.string().min(1, "Google ID token is required"),
});

export const googleOAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedData = googleOAuthSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }

        const { token } = parsedData.data;

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: "Invalid Google token payload" });
            return;
        }

        const email = payload.email;

        // Check if user exists
        let userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
        let user = userRecords[0];

        if (!user) {
            // Create user
            const [insertResult] = await db.insert(users).values({
                email,
                name: payload.name || null,
                password: null, // No password for OAuth users
                isVerified: true, // OAuth emails are pre-verified by provider
            });
            user = {
                id: insertResult.insertId,
                email,
                name: payload.name || null,
                password: null,
                isVerified: true,
                isTwoFactorEnabled: false,
                role: "user",
                greenApiInstanceId: null,
                greenApiToken: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastActive: new Date()
            };
        } else if (user.isTwoFactorEnabled) {
            // Standard 2FA logic if user is already enrolled, though usually OAuth bypasses 2FA 
            // or we can enforce it. Let's enforce it for security consistency if they enabled it.
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 5 * 60 * 1000);

            await db.delete(verificationTokens).where(eq(verificationTokens.identifier, user.email));
            await db.insert(verificationTokens).values({
                identifier: user.email,
                token: otp,
                expires,
            });

            await EmailService.sendOTPEmail(user.email, otp);
            res.status(200).json({ message: "2FA required. OTP sent to email.", userId: user.id, isTwoFactorEnabled: true });
            return;
        }

        // Link OAuth account if not linked
        const existingAccounts = await db
            .select()
            .from(oauthAccounts)
            .where(eq(oauthAccounts.providerAccountId, payload.sub))
            .limit(1);

        if (existingAccounts.length === 0) {
            await db.insert(oauthAccounts).values({
                userId: user.id,
                provider: "google",
                providerAccountId: payload.sub,
            });
        }

        const jwtTokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

        // Send Welcome Email for new Google users
        if (!userRecords[0]) {
            await EmailService.sendWelcomeEmail(email, payload.name || "User");
        }

        res.status(200).json({
            message: "Google login successful",
            user: { id: user.id, email: user.email, role: user.role },
            ...jwtTokens,
        });
    } catch (error) {
        console.error("Google OAuth Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }

        const payload = verifyRefreshToken(token);
        if (!payload) {
            res.status(401).json({ error: "Invalid or expired refresh token" });
            return;
        }

        const { accessToken } = generateTokens({ userId: payload.userId, email: payload.email, role: payload.role });
        res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Refresh Token Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const forgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ status: false, message: 'Email is required' });
            return;
        }

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            res.status(404).json({ status: false, message: 'User with this email does not exist' });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
        await db.insert(verificationTokens).values({
            identifier: email,
            token: otp,
            expires,
        });

        await EmailService.sendForgotPasswordOTPEmail(email, otp);
        res.json({ status: true, message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('Forgot Password OTP Error', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

export const verifyForgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ status: false, message: 'Email and OTP are required' });
            return;
        }

        const tokens = await db.select().from(verificationTokens).where(eq(verificationTokens.identifier, email));
        const tokenRecord = tokens.find(t => t.token === otp);

        if (!tokenRecord || new Date() > tokenRecord.expires) {
            res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
            return;
        }

        res.json({ status: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Verify Forgot Password OTP Error', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ status: false, message: 'All fields are required' });
            return;
        }

        const tokens = await db.select().from(verificationTokens).where(eq(verificationTokens.identifier, email));
        const tokenRecord = tokens.find(t => t.token === otp);

        if (!tokenRecord || new Date() > tokenRecord.expires) {
            res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
            return;
        }

        const hashedPassword = await hashPassword(newPassword);
        await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));
        await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRecord.id));

        await EmailService.sendPasswordResetSuccessEmail(email);
        res.json({ status: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
