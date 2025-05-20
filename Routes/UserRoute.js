import express from "express";
import { signUpPasien, getAllPasien } from "../controllers/AccountControllers.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Welcome to the User API",
    });
    }
);

router.post("/register", signUpPasien); 
router.get("/getAllPasien", getAllPasien);

export default router;