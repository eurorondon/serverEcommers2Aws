import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    categoria: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      // required: true,
    },
    // photo: [
    //   {
    //     url: String,
    //     public_id: String,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
