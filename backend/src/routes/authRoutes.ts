import { Router } from "express";
import { login, refresh, register } from "../controllers/authController";
import { authRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/register", register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", refresh);

export default router;
