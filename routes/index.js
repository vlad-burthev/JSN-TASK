import { Router } from "express";
import multer from "multer";
//controllers
import {
  addImages,
  changeSuperhero,
  createSuperhero,
  deleteImage,
  deleteSuperhero,
  getAllSuperhero,
  getOneSuperhero,
} from "../controllers/superHeroController.js";
//validator
import {
  changeSuperheroValidator,
  createSuperheroValidator,
} from "../validator/superhero.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const router = Router();

router.get("/get_one/:slug", getOneSuperhero); // get one
router.get("/get_all", getAllSuperhero); // get all

router.post(
  "/create",
  upload.array("images"),
  createSuperheroValidator,
  createSuperhero
); //create

router.delete("/delete/:slug", deleteSuperhero); //delete
router.delete("/delete_image/:slug", deleteImage); //delete image

router.put("/change/:slug", changeSuperheroValidator, changeSuperhero); //change
router.put("/add_images/:slug", upload.array("images"), addImages); //add images
