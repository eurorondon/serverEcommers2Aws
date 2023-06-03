import express from "express";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "../Models/UserModel.js";
import Category from "./../Models/CategoryModel.js";

const categoryRouter = express.Router();

// CATEGORY PRODUCT
categoryRouter.post(
  "/add",
  asyncHandler(async (req, res) => {
    const { categoria, description } = req.body;

    const categoriaExist = await Category.findOne({ categoria });
    if (categoriaExist) {
      res.status(400);
      throw new Error("Categoria name already exists");
    } else {
      const category = new Category({
        categoria,
        description,
      });

      if (category) {
        const createdCategoria = await category.save();
        res.status(201).json(createdCategoria);
      } else {
        res.status(400);
        throw new Error("Invalid category data");
      }
    }
  })
);

// get CATEGORY
categoryRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const categoria = await Category.find({});
    res.json(categoria);
  })
);

export default categoryRouter;

// Delete Category

categoryRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const categoryId = req.params.id;

    // Verificar si la categoría existe
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    // Eliminar la categoría
    await category.remove();

    res.json({ message: "Category deleted successfully" });
  })
);

//UPDATE CATEGORY

categoryRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const { categoria, description } = req.body;

    // Verificar si la categoría existe
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    // Actualizar los campos de la categoría
    category.categoria = categoria;
    category.description = description;

    // Guardar los cambios
    const updatedCategory = await category.save();

    res.json(updatedCategory);
  })
);
