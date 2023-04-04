import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protect } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import EmailSender from "./../sendEmail.js";
import EmailSenderAdmin from "./../sendEmailAdmin.js";
import { uploadImageComprobante } from "./../libs/cloudinary.js";
import Comprobante from "../Models/ComprobanteModel.js";
import fs from "fs-extra";

const orderRouter = express.Router();

// CREATE ORDER
orderRouter.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      // shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
      return;
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        // shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createOrder = await order.save();
      res.status(201).json(createOrder);
    }
  })
);

// ADMIN GET ALL ORDERS
orderRouter.get(
  "/all",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name number email");
    res.json(orders);
  })
);
// USER LOGIN ORDERS
orderRouter.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(order);
  })
);

// GET ORDER BY ID
orderRouter.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name number email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS PAID
orderRouter.put(
  "/:id/pay",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS DELIVERED
orderRouter.put(
  "/:id/delivered",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ****** SEND EMAIL CLIENT & ADMIN
orderRouter.post("/send", async (req, res) => {
  const order = await Order.findById(req.params.id);
  try {
    const { totalPrice, _id, userName, email } = req.body;
    EmailSender({ totalPrice, _id, userName, email });
    EmailSenderAdmin({ totalPrice, _id, userName, email });
    res.json({ msg: "Your message sent successfully" });
    console.log(req.body);
  } catch (error) {
    console.log(res);
    res.status(404).json({ msg: "Error ❌" });
  }
});

// CONFIRANDO PAGO
orderRouter.put(
  "/:id/confirmpay",

  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    console.log(order);

    if (order) {
      order.ConfirmandoPago = true;
      order.ConfirmandoPagoAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404, order);
      throw new Error("Order Not Found");
    }
  })
);

// UPLOAD IMAGE COMPROBANTE DE PAGO
orderRouter.put(
  "/:id/upload",
  // protect,
  // admin,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    console.log(order);

    let image;
    if (req.files.image) {
      console.log(req.files.image);
      const result = await uploadImageComprobante(req.files.image.tempFilePath);
      await fs.remove(req.files.image.tempFilePath);

      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    try {
      if (order) {
        order.comprobantePago = image.url;
      }
      const updatedOrder = await order.save();
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
    // const { name, price, description, image, countInStock, categories } =
    //   req.body;
  })
);

export default orderRouter;
