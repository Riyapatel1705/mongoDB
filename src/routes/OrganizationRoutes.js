import express from "express";
import { createOrganization,updateOrganization,deleteOrganization } from "../controllers/OrganizationController.js";
import { Authorization } from "../middleware/Auth.js";
const OrganizationRouter = express.Router();



OrganizationRouter.post("/api/create/organization",createOrganization);
OrganizationRouter.put("/api/organizations/:organization_id", Authorization, updateOrganization);
OrganizationRouter.delete("/api/organizations/:organization_id", Authorization, deleteOrganization);

export {OrganizationRouter};