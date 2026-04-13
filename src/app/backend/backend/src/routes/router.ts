import express from "express";

const router = express.Router();


// Users routes

import user from "./user";

router.use(user);


export default router;