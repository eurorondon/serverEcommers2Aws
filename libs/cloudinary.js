import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dpgpmqo6c",
  api_key: "256394315488875",
  api_secret: "Fll8ueVOonn9Lnu9_1sQQODPV8g",
});

export const uploadImage = async (filepath) => {
  return await cloudinary.uploader.upload(filepath, {
    folder: "laraPlastic",
  });
};

export const uploadImageComprobante = async (filepath) => {
  return await cloudinary.uploader.upload(filepath, {
    folder: "ComprobantesDePago",
  });
};

export const deleteImage = async (id) => {
  return await cloudinary.uploader.destroy(id);
};
