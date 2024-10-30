import { DataTypes } from "sequelize";
import db from "../db.js";

export const Superhero = db.define("Superhero", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  nickname: { type: DataTypes.STRING, unique: true, allowNull: false },
  real_name: { type: DataTypes.STRING, allowNull: false },
  origin_description: { type: DataTypes.STRING, allowNull: false },
  superpowers: { type: DataTypes.STRING, allowNull: false },
  catch_phrase: { type: DataTypes.STRING, allowNull: false },
  images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
});

export default Superhero;
