import { Router } from "express";
import { login, getMe, logout, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;