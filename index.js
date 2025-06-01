import express from "express";
import cors from "cors";
import UserRoute from './Routes/UserRoute.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use(UserRoute);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

