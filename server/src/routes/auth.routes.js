import { Router } from "express";
import { debugLogin, me, logout } from "../controllers/auth.controller.js";
import { register, login } from "../controllers/auth.controller.js";

export const authRouter = Router();

//testers
authRouter.post("/debug-login", debugLogin);
authRouter.get("/me", me);
authRouter.post("/logout", logout);

// Real auth
authRouter.post("/register", register);
authRouter.post("/login", login);
