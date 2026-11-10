import { Router } from "express";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { registerLimiter, loginLimiter, refreshLimiter } from "../../shared/middleware/rate-limiter.js";
import { validate } from "../../shared/middleware/validate.js";
import { authController } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), authController.register);
router.get("/me", authenticate, authController.me);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", authController.logout);

export default router;