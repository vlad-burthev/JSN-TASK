//dependencies
import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
//db
import db from "./db.js";
import "./model/model.js";
//router
import { router } from "./routes/index.js";
//middleware
import ErrorHandleMiddleware from "./middleware/ErrorHandleMiddleware.js";

configDotenv();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use(express.static(path.resolve("./uploads")));
app.use(fileUpload({ createParentPath: true }));
app.use(ErrorHandleMiddleware);

const start = async () => {
  try {
    await db.authenticate();
    await db.sync();

    app.listen(PORT, () => console.log(`[Server]: started on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
