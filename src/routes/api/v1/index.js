import express from "express";
import authRoutes from "./auth.js";
import invitationRoutes from "./invitations.js";
import helloRoute from "./hello.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/invitations", invitationRoutes);
router.use("/hello", helloRoute);

export default router;
