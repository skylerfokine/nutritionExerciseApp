import { Router } from "express";
import { debugLogin, me, logout } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/debug-login", debugLogin);
authRouter.get("/me", me);
authRouter.post("/logout", logout);
