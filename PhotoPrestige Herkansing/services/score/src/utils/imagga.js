import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const IMAGGA_API_KEY = process.env.IMAGGA_API_KEY;
const IMAGGA_API_SECRET = process.env.IMAGGA_API_SECRET;
const IMAGGA_BASE_URL = "https://api.imagga.com/v2";

export async function uploadToImagga(filePath) {
  const formData = new FormData();
  formData.append("image", fs.createReadStream(filePath));

  const response = await axios.post(`${IMAGGA_BASE_URL}/uploads`, formData, {
    auth: {
      username: IMAGGA_API_KEY,
      password: IMAGGA_API_SECRET,
    },
    headers: formData.getHeaders(),
  });

  return response.data.result.upload_id;
}

// Compare two images based on Imagga categories similarity
export async function compareImages(image1PathOrId, image2PathOrId, useUploadIds = true) {
  try {
    // If we're using upload IDs
    if (useUploadIds) {
      const response = await axios.get(
        `${IMAGGA_BASE_URL}/images-similarity/categories/general_v3`,
        {
          auth: {
            username: IMAGGA_API_KEY,
            password: IMAGGA_API_SECRET,
          },
          params: {
            image_upload_id: image1PathOrId,
            image2_upload_id: image2PathOrId,
          },
        }
      );

      return response.data.result.distance;
    }

    // Otherwise, send the local files directly
    const formData = new FormData();
    formData.append("image", fs.createReadStream(image1PathOrId));
    formData.append("image2", fs.createReadStream(image2PathOrId));

    const response = await axios.post(
      `${IMAGGA_BASE_URL}/images-similarity/categories/general_v3`,
      formData,
      {
        auth: {
          username: IMAGGA_API_KEY,
          password: IMAGGA_API_SECRET,
        },
        headers: formData.getHeaders(),
      }
    );

    return response.data.result.distance;
  } catch (err) {
    console.error("❌ Error comparing images:", err.response?.data || err.message);
    throw err;
  }
}
