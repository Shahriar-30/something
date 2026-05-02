import express from "express";
import authRoutes from "./auth.js";
import invitationRoutes from "./invitations.js";
import businessRoutes from "./businesses.js";
import businessMembersRoutes from "./businessMembers.js";
import contactsRoutes from "./contacts.js";
import leadsRoutes from "./leads.js";
import helloRoute from "./hello.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/invitations", invitationRoutes);
router.use("/businesses", businessRoutes);
router.use("/business-members", businessMembersRoutes);
router.use("/contacts", contactsRoutes);
router.use("/leads", leadsRoutes);
router.use("/hello", helloRoute);

export default router;
