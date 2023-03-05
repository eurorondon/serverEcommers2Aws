import mongoose from "mongoose";

const comprobanteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comprobante = mongoose.model("Comprobante", comprobanteSchema);

export default Comprobante;
