import express from "express";
import cors from "cors";
import { db, auth } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";

const app = express();
app.use(cors());

// Define the port
const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//API routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});
