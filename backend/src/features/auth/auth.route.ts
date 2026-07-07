import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { authController } from "./auth.controller.js";
import { registerSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);

export default router;