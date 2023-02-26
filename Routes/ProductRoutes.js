import express from "express";
import asyncHandler from "express-async-handler";
import Product from "./../Models/ProductModel.js";
import { admin, protect } from "./../Middleware/AuthMiddleware.js";
import { uploadImage, deleteImage } from "../libs/cloudinary.js";
import fs from "fs-extra";

const productRoute = express.Router();

// GET ALL PRODUCT  DE FORMA TOTAL MENTE SIMPLE Y ORIGINAL
// productRoute.get(
//   "/",
//   asyncHandler(async (req, res) => {
//     const products = await Product.find({});

//     res.json(products);
//   })
// );

// GET ALL PRODUCT CON BUSCADOR SEARCH  Y  PAGINACION
// productRoute.get(
//   "/",
//   asyncHandler(async (req, res) => {
//     const pageSize = 10;
//     const page = Number(req.query.pageNumber) || 2;
//     const keyword = req.query.keyword
//       ? {
//           name: {
//             $regex: req.query.keyword,
//             $options: "i",
//           },
//         }
//       : {};
//     const count = await Product.countDocuments({ ...keyword });
//     const products = await Product.find({ ...keyword })
//       .limit(pageSize)
//       .skip(pageSize * (page - 1))
//       .sort({ _id: -1 });

//     res.json({ products, page, pages: Math.ceil(count / pageSize) });
//   })
// );

// GET ALL PRODUCT FORMA LAMA
productRoute.get("/", async (req, res) => {
  // const pageSize = 12;
  // const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  let count = await Product.countDocuments({ ...keyword });
  let products;

  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qColor = req.query.color;

  if (qColor) {
    products = await Product.find({
      color: {
        $in: [qColor],
      },
    });
  } else if (qNew) {
    products = await Product.find().sort({ createdAt: -1 }).limit(1);
  } else if (qCategory) {
    const categoryKeyword = {
      categories: {
        $in: [qCategory],
      },
    };
    products = await Product.find({ ...keyword, ...categoryKeyword })
      // .limit(pageSize)
      // .skip(pageSize * (page - 1))
      .sort({ _id: -1 });

    count = await Product.countDocuments({ ...keyword, ...categoryKeyword });
  } else {
    products = await Product.find({ ...keyword })
      // .limit(pageSize)
      // .skip(pageSize * (page - 1))
      .sort({ _id: -1 });
  }

  res.status(200).json({
    products,
    // page,
    // pages: Math.ceil(count / pageSize),
    count,
  });
});

// ADMIN GET ALL PRODUCT WITHOUT SEARCH AND PEGINATION
productRoute.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products);
  })
);

// GET SINGLE PRODUCT
productRoute.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);

// PRODUCT REVIEW
productRoute.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already Reviewed");
      }
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Reviewed Added" });
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);

// DELETE PRODUCT
productRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.json({ message: "Product deleted" });

      if (product.photo.public_id) {
        await deleteImage(product.photo.public_id);
      }
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);

// CREATE PRODUCT
productRoute.post(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock, categories } =
      req.body;
    let photo;
    if (req.files) {
      const result = await uploadImage(req.files.photo.tempFilePath);
      await fs.remove(req.files.photo.tempFilePath);
      photo = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } else {
      photo = {
        url: image,
      };
    }

    const productExist = await Product.findOne({ name });
    if (productExist) {
      res.status(400);
      throw new Error("Product name already exist");
    } else {
      const product = new Product({
        name,
        price,
        description,
        image,
        photo,
        countInStock,
        categories,
        user: req.user._id,
      });
      if (product) {
        const createdproduct = await product.save();
        res.status(201).json(createdproduct);
      } else {
        res.status(400);

        throw new Error("Invalid product data");
      }
    }
  })
);

// UPDATE PRODUCT
productRoute.put(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const { name, price, description, image, countInStock, categories } =
      req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.countInStock = countInStock || product.countInStock;
      product.categories = categories || product.categories;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  })
);

// PRODUCT IMAGE
productRoute.post(
  "/:id/image",
  // protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    const { image } = req.body;

    if (product) {
      let photo;
      if (req.files) {
        const result = await uploadImage(req.files.photo.tempFilePath);
        await fs.remove(req.files.photo.tempFilePath);
        photo = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } else {
        photo = {
          url: image,
        };

        console.log(photo);
      }
      product.photo.push(photo);

      await product.save();
      res.status(201).json({ message: "Foto agregada" });
    } else {
      res.status(404);
      throw new Error("Product not Found");
    }
  })
);
export default productRoute;
