import express from "express";
import {
  signUpPasien,
  getAllPasien,
  signInPasien,
} from "../controllers/AccountControllers.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Welcome to the User API",
  });
});

router.post("/auth/signUpPasien", signUpPasien);

router.post("/auth/signInPasien", signInPasien);

router.get("/getAllPasien", getAllPasien);

export default router;
