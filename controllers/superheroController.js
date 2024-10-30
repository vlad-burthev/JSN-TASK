import { validationResult } from "express-validator";
import * as uuid from "uuid";
import sharp from "sharp";
import fs, { existsSync } from "fs";
import path from "path";

import { ApiError } from "../error/ApiError.js";
import Superhero from "../model/model.js";
import { where } from "sequelize";

const UPLOADDIR = path.resolve("uploads");

export const createSuperhero = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(ApiError.badRequest(errors.array()));
    }

    const {
      nickname,
      real_name,
      origin_description,
      superpowers,
      catch_phrase,
    } = req.body;
    const images = req.files;

    const existingHero = await Superhero.findOne({ where: { nickname } });
    if (existingHero) {
      return next(ApiError.badRequest("Superhero already exists"));
    }

    const slug = `${nickname.replace(/ /g, "_").toLowerCase()}`;
    const uniqueId = uuid.v4();

    if (!fs.existsSync(UPLOADDIR)) {
      console.log("Uploads directory created:", UPLOADDIR);
      fs.mkdirSync(UPLOADDIR);
    }

    const imageNames = [];

    for (const image of images) {
      if (!image.mimetype.startsWith("image/")) {
        return next(ApiError.badRequest("Uploaded file is not an image"));
      }
      const uniqueImageName = `${nickname
        .replace(/ /g, "_")
        .toLowerCase()}_${uuid.v1()}.webp`;
      const outputImagePath = path.join(UPLOADDIR, uniqueImageName);

      try {
        await sharp(image.buffer).toFormat("webp").toFile(outputImagePath);

        imageNames.push(uniqueImageName);
      } catch (sharpError) {
        console.error("Error processing image:", sharpError);
        return next(ApiError.internal("Failed to process image"));
      }
    }

    await Superhero.create({
      id: uniqueId,
      slug,
      nickname,
      real_name,
      origin_description,
      superpowers,
      catch_phrase,
      images: imageNames,
    });

    return res.json({ message: "Superhero created successfully" });
  } catch (error) {
    console.error(error);
    next(ApiError.internal(error.message));
  }
};

export const deleteSuperhero = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const existingHero = await Superhero.findOne({ where: { slug } });

    console.log(existingHero);

    if (!existingHero) {
      return next(ApiError.notFound(["Superhero not found"]));
    }

    const { images } = existingHero;

    for (const imageName of images) {
      const imagePath = path.join(UPLOADDIR, imageName);
      console.log(`Deleting image: ${imagePath}`);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Image deleted: ${imagePath}`);
      } else {
        console.log(`Image not found: ${imagePath}`);
      }
    }

    await Superhero.destroy({ where: { slug } });
    return res.json({ message: "Superhero deleted successfully" });
  } catch (error) {
    console.log(error);
    next(ApiError.internal(error.message));
  }
};

export const getOneSuperhero = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const existingHero = await Superhero.findOne({ where: { slug } });

    if (!existingHero) {
      return next(ApiError.notFound(["Hero not found"]));
    }

    return res.status(200).json(existingHero);
  } catch (error) {
    console.log(error);
    next(ApiError.internal(error.message));
  }
};

export const getAllSuperhero = async (req, res, next) => {
  try {
    let { page } = req.query;
    page = page || 1;

    let offset = page * 5 - 5;
    const { count, rows: existingHeroes } = await Superhero.findAndCountAll({
      limit: 5,
      offset,
    });

    if (!existingHeroes) {
      return next(ApiError.notFound(["Heroes not found"]));
    }

    return res
      .status(200)
      .json({ heroes: existingHeroes, currentPage: page, count });
  } catch (error) {
    console.log(error);
    next(ApiError.internal(error.message));
  }
};

export const changeSuperhero = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const updatedData = req.body;

    const existingHero = await Superhero.findOne({ where: { slug } });

    if (!existingHero) {
      return next(ApiError.notFound("Superhero not found"));
    }

    if (
      updatedData?.nickname &&
      updatedData.nickname !== existingHero.nickname
    ) {
      const existingWithSameNameHero = await Superhero.findOne({
        where: { nickname: updatedData.nickname },
      });
      if (existingWithSameNameHero) {
        return next(
          ApiError.badRequest("Hero with this nickname already exists")
        );
      }
    }

    for (const key of Object.keys(updatedData)) {
      if (updatedData[key] !== existingHero[key]) {
        existingHero[key] = updatedData[key];

        if (key === "nickname") {
          const newSlug = `${updatedData.nickname
            .replace(/ /g, "_")
            .toLowerCase()}`;
          existingHero.slug = newSlug;
        }
      }
    }

    await existingHero.save();

    return res.json({
      message: "Superhero updated successfully",
      updatedHero: existingHero,
    });
  } catch (error) {
    console.error(error);
    next(ApiError.internal(error.message));
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { imageName } = req.body;

    const superhero = await Superhero.findOne({ where: { slug } });

    if (!superhero) {
      return next(ApiError.notFound("Superhero not found"));
    }

    const { images } = superhero;

    if (!images.includes(imageName)) {
      return next(ApiError.notFound("Image not found for this superhero"));
    }

    const imagePath = path.join(UPLOADDIR, imageName);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Image deleted: ${imagePath}`);
    } else {
      console.log(`Image not found on server: ${imagePath}`);
    }

    const updatedImages = images.filter((img) => img !== imageName);
    superhero.images = updatedImages;
    await superhero.save();

    return res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    next(ApiError.internal(error.message));
  }
};

export const addImages = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const images = req.files;
    console.log(images);
    console.log("files" + req.files);

    const existingHero = await Superhero.findOne({ where: { slug } });

    if (!existingHero) {
      return next(ApiError.notFound("Superhero not found"));
    }

    if (!fs.existsSync(UPLOADDIR)) {
      console.log("Uploads directory created:", UPLOADDIR);
      fs.mkdirSync(UPLOADDIR);
    }

    const newImageNames = [];

    for (const image of images) {
      if (!image.mimetype.startsWith("image/")) {
        return next(ApiError.badRequest("Uploaded file is not an image"));
      }
      const uniqueImageName = `${existingHero.nickname
        .replace(/ /g, "_")
        .toLowerCase()}_${uuid.v1()}.webp`;
      const outputImagePath = path.join(UPLOADDIR, uniqueImageName);

      try {
        await sharp(image.buffer).toFormat("webp").toFile(outputImagePath);

        newImageNames.push(uniqueImageName);
      } catch (sharpError) {
        console.error("Error processing image:", sharpError);
        return next(ApiError.internal("Failed to process image"));
      }
    }

    const updatedImages = [...(existingHero.images || []), ...newImageNames];
    await Superhero.update({ images: updatedImages }, { where: { slug } });

    return res.status(200).json("Successfully added images");
  } catch (error) {
    console.log(error);
    next(ApiError.internal(error.message));
  }
};
