"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/verify-otp", auth_controller_1.verifyOTP);
router.post("/refresh", auth_controller_1.refreshToken);
router.post("/enable-2fa", auth_middleware_1.authenticate, auth_controller_1.enable2FA);
router.post("/google", auth_controller_1.googleOAuth);
// Forgot Password
router.post("/forgot-password", auth_controller_1.forgotPasswordOTP);
router.post("/verify-forgot-otp", auth_controller_1.verifyForgotPasswordOTP);
router.post("/reset-password", auth_controller_1.resetPassword);
// Protected route example
router.get("/me", auth_middleware_1.authenticate, (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
