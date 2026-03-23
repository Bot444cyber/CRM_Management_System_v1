"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyForgotPasswordOTP = exports.forgotPasswordOTP = exports.refreshToken = exports.googleOAuth = exports.enable2FA = exports.verifyOTP = exports.login = exports.register = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const email_service_1 = __importDefault(require("../services/email.service"));
const schema_2 = require("../db/schema");
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1, "Password is required"),
});
const register = async (req, res) => {
    try {
        const parsedData = registerSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }
        const { email, password } = parsedData.data;
        const existingUser = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        if (existingUser.length > 0) {
            res.status(400).json({ error: "Email already in use" });
            return;
        }
        // Generate OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        // Delete any existing OTPs for this email to avoid clutter
        await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, email));
        await db_1.db.insert(schema_2.verificationTokens).values({
            identifier: email,
            token: otp,
            expires,
        });
        await email_service_1.default.sendOTPEmail(email, otp);
        res.status(201).json({
            message: "OTP sent successfully. Please verify your email.",
            requiresVerification: true
        });
    }
    catch (error) {
        console.error("Registration Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const parsedData = loginSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }
        const { email, password } = parsedData.data;
        const existingUsers = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        const user = existingUsers[0];
        if (!user || !user.password) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await (0, hash_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        if (!user.isVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 5 * 60 * 1000);
            await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, user.email));
            await db_1.db.insert(schema_2.verificationTokens).values({
                identifier: user.email,
                token: otp,
                expires,
            });
            await email_service_1.default.sendOTPEmail(user.email, otp);
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
            await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, user.email));
            // Save new OTP
            await db_1.db.insert(schema_2.verificationTokens).values({
                identifier: user.email,
                token: otp,
                expires,
            });
            // Send Email
            await email_service_1.default.sendOTPEmail(user.email, otp);
            res.status(200).json({ message: "2FA required. OTP sent to email.", userId: user.id, isTwoFactorEnabled: true });
            return;
        }
        const tokens = (0, jwt_1.generateTokens)({ userId: user.id, email: user.email, role: user.role });
        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, role: user.role },
            ...tokens,
        });
    }
    catch (error) {
        console.error("Login Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.login = login;
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").optional(),
    fullName: zod_1.z.string().optional(),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
});
const verifyOTP = async (req, res) => {
    try {
        const parsedData = verifyOtpSchema.safeParse(req.body);
        if (!parsedData.success) {
            res.status(400).json({ error: parsedData.error.format() });
            return;
        }
        const { email, otp, password, fullName } = parsedData.data;
        const tokens = await db_1.db.select().from(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, email));
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
        let userRecords = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        let user = userRecords[0];
        if (!user) {
            if (!password) {
                res.status(400).json({ error: "Password is required for registration" });
                return;
            }
            // Create new verified user since OTP is confirmed
            const hashedPassword = await (0, hash_1.hashPassword)(password);
            const [insertResult] = await db_1.db.insert(schema_1.users).values({
                email,
                password: hashedPassword,
                isVerified: true,
            });
            user = {
                id: insertResult.insertId,
                email,
                password: hashedPassword,
                isVerified: true,
                isTwoFactorEnabled: false,
                role: "user",
                greenApiInstanceId: null,
                greenApiToken: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        else if (!user.isVerified) {
            await db_1.db.update(schema_1.users).set({ isVerified: true }).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
            user.isVerified = true;
        }
        // Delete token after successful use
        await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.id, tokenRecord.id));
        const jwtTokens = (0, jwt_1.generateTokens)({ userId: user.id, email: user.email, role: user.role });
        // Send Welcome Email if it's a new registration
        if (password && fullName) {
            await email_service_1.default.sendWelcomeEmail(email, fullName);
        }
        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, role: user.role },
            ...jwtTokens,
        });
    }
    catch (error) {
        console.error("OTP Verification Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.verifyOTP = verifyOTP;
const enable2FA = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        await db_1.db.update(schema_1.users).set({ isTwoFactorEnabled: true }).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        res.json({ message: "Two-Step Verification enabled successfully" });
    }
    catch (error) {
        console.error("Enable 2FA Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.enable2FA = enable2FA;
const googleOAuthSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Google ID token is required"),
});
const googleOAuth = async (req, res) => {
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
        let userRecords = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        let user = userRecords[0];
        if (!user) {
            // Create user
            const [insertResult] = await db_1.db.insert(schema_1.users).values({
                email,
                password: null, // No password for OAuth users
                isVerified: true, // OAuth emails are pre-verified by provider
            });
            user = {
                id: insertResult.insertId,
                email,
                password: null,
                isVerified: true,
                isTwoFactorEnabled: false,
                role: "user",
                greenApiInstanceId: null,
                greenApiToken: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        else if (user.isTwoFactorEnabled) {
            // Standard 2FA logic if user is already enrolled, though usually OAuth bypasses 2FA 
            // or we can enforce it. Let's enforce it for security consistency if they enabled it.
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 5 * 60 * 1000);
            await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, user.email));
            await db_1.db.insert(schema_2.verificationTokens).values({
                identifier: user.email,
                token: otp,
                expires,
            });
            await email_service_1.default.sendOTPEmail(user.email, otp);
            res.status(200).json({ message: "2FA required. OTP sent to email.", userId: user.id, isTwoFactorEnabled: true });
            return;
        }
        // Link OAuth account if not linked
        const existingAccounts = await db_1.db
            .select()
            .from(schema_2.oauthAccounts)
            .where((0, drizzle_orm_1.eq)(schema_2.oauthAccounts.providerAccountId, payload.sub))
            .limit(1);
        if (existingAccounts.length === 0) {
            await db_1.db.insert(schema_2.oauthAccounts).values({
                userId: user.id,
                provider: "google",
                providerAccountId: payload.sub,
            });
        }
        const jwtTokens = (0, jwt_1.generateTokens)({ userId: user.id, email: user.email, role: user.role });
        // Send Welcome Email for new Google users
        if (!userRecords[0]) {
            await email_service_1.default.sendWelcomeEmail(email, payload.name || "User");
        }
        res.status(200).json({
            message: "Google login successful",
            user: { id: user.id, email: user.email, role: user.role },
            ...jwtTokens,
        });
    }
    catch (error) {
        console.error("Google OAuth Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.googleOAuth = googleOAuth;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        if (!payload) {
            res.status(401).json({ error: "Invalid or expired refresh token" });
            return;
        }
        const { accessToken } = (0, jwt_1.generateTokens)({ userId: payload.userId, email: payload.email, role: payload.role });
        res.status(200).json({ accessToken });
    }
    catch (error) {
        console.error("Refresh Token Error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.refreshToken = refreshToken;
const forgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ status: false, message: 'Email is required' });
            return;
        }
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        if (!user) {
            res.status(404).json({ status: false, message: 'User with this email does not exist' });
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, email));
        await db_1.db.insert(schema_2.verificationTokens).values({
            identifier: email,
            token: otp,
            expires,
        });
        await email_service_1.default.sendForgotPasswordOTPEmail(email, otp);
        res.json({ status: true, message: 'OTP sent successfully to your email' });
    }
    catch (error) {
        console.error('Forgot Password OTP Error', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
exports.forgotPasswordOTP = forgotPasswordOTP;
const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ status: false, message: 'Email and OTP are required' });
            return;
        }
        const tokens = await db_1.db.select().from(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, email));
        const tokenRecord = tokens.find(t => t.token === otp);
        if (!tokenRecord || new Date() > tokenRecord.expires) {
            res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
            return;
        }
        res.json({ status: true, message: 'OTP verified successfully' });
    }
    catch (error) {
        console.error('Verify Forgot Password OTP Error', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
exports.verifyForgotPasswordOTP = verifyForgotPasswordOTP;
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ status: false, message: 'All fields are required' });
            return;
        }
        const tokens = await db_1.db.select().from(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.identifier, email));
        const tokenRecord = tokens.find(t => t.token === otp);
        if (!tokenRecord || new Date() > tokenRecord.expires) {
            res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
            return;
        }
        const hashedPassword = await (0, hash_1.hashPassword)(newPassword);
        await db_1.db.update(schema_1.users).set({ password: hashedPassword }).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        await db_1.db.delete(schema_2.verificationTokens).where((0, drizzle_orm_1.eq)(schema_2.verificationTokens.id, tokenRecord.id));
        await email_service_1.default.sendPasswordResetSuccessEmail(email);
        res.json({ status: true, message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Reset Password Error', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
