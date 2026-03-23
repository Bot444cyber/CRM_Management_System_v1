import { Router } from "express";
import {
    register,
    login,
    verifyOTP,
    enable2FA,
    googleOAuth,
    refreshToken,
    forgotPasswordOTP,
    verifyForgotPasswordOTP,
    resetPassword
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/refresh", refreshToken);
router.post("/enable-2fa", authenticate, enable2FA);
router.post("/google", googleOAuth);

// Forgot Password
router.post("/forgot-password", forgotPasswordOTP);
router.post("/verify-forgot-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);

// Protected route example
router.get("/me", authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;
