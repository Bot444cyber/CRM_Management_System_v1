import { Router } from "express";
import { register, login, verifyOTP, enable2FA, googleOAuth, refreshToken } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/refresh", refreshToken);
router.post("/enable-2fa", authenticate, enable2FA);
router.post("/google", googleOAuth);

// Protected route example
router.get("/me", authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;
