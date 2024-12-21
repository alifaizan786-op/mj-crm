"use strict";

const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");

async function downloadImage(imgUrl, imgName) {
  const url = imgUrl;
  const path = Path.resolve(__dirname, "../images", imgName);
  const writer = Fs.createWriteStream(path);

  try {
    const response = await Axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    throw error; // Re-throw the error so it can be caught in the calling function
  }
}

function formatSkuToImage(sku) {
  if (sku.length === 7) {
    return `00${sku.split("-").join("")}`;
  } else if (sku.length === 8) {
    return `0${sku.split("-").join("")}`;
  } else {
    return `${sku.split("-").join("")}`;
  }
}

module.exports = { downloadImage, formatSkuToImage };
