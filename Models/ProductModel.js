import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // image: {
    //   type: Array,
    // },

    photo: [
      {
        url: String,
        public_id: String,
      },
    ],

    categories: {
      type: Array,
    },
    color: {
      type: String,
    },

    description: {
      type: String,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,

      default: 0,
    },
    numReviews: {
      type: Number,

      default: 0,
    },
    price: {
      type: Number,
      // required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      // required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
