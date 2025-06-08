import express from "express";
import {
  signUp,
  getAllPasien,
  signIn,
} from "../controllers/AccountControllers.js";
import { getDashboardData } from "../controllers/DashboardControllers.js";
import { getRiwayatMedisData } from "../controllers/RiwayatMedisControllers.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Welcome to the User API",
  });
});

router.post("/auth/signUp", signUp);

router.post("/auth/signIn", signIn);

router.get("/getAllPasien", getAllPasien);

router.get("/dashboard/:nikPasien", getDashboardData);

router.get("/riwayatMedis/:nikPasien", getRiwayatMedisData);

export default router;
