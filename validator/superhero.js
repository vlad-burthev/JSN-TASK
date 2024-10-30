import { body } from "express-validator";

export const createSuperheroValidator = [
  body("nickname")
    .isString()
    .withMessage("Nickname must be a string")
    .notEmpty()
    .withMessage("Nickname is required"),
  body("real_name")
    .isString()
    .withMessage("Real name must be a string")
    .notEmpty()
    .withMessage("Real name is required"),
  body("origin_description")
    .isString()
    .withMessage("Origin description must be a string")
    .notEmpty()
    .withMessage("Origin description is required"),
  body("superpowers")
    .isString()
    .withMessage("Superpowers must be a string")
    .notEmpty()
    .withMessage("Superpowers are required"),
  body("catch_phrase")
    .isString()
    .withMessage("Catch phrase must be a string")
    .notEmpty()
    .withMessage("Catch phrase is required"),
];

export const changeSuperheroValidator = [
  body("nickname")
    .optional()
    .isString()
    .withMessage("Nickname must be a string")
    .notEmpty()
    .withMessage("Nickname cannot be empty"),

  body("real_name")
    .optional()
    .isString()
    .withMessage("Real name must be a string")
    .notEmpty()
    .withMessage("Real name cannot be empty"),

  body("origin_description")
    .optional()
    .isString()
    .withMessage("Origin description must be a string")
    .notEmpty()
    .withMessage("Origin description cannot be empty"),

  body("superpowers")
    .optional()
    .isString()
    .withMessage("Superpowers must be a string")
    .notEmpty()
    .withMessage("Superpowers cannot be empty"),

  body("catch_phrase")
    .optional()
    .isString()
    .withMessage("Catch phrase must be a string")
    .notEmpty()
    .withMessage("Catch phrase cannot be empty"),
];
