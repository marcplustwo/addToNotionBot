import { config } from "../config";
import fetch from "node-fetch";
import axios from "axios";

const uploadFile = async (telegramURL: string): Promise<string> => {
  // const resp = await fetch(config.imgUploadURL, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     url: telegramURL,
  //   }),
  // });

  const resp = await axios.post(
    config.imgUploadURL,
    {
      url: telegramURL,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (resp.status != 200) {
    throw new Error("Error uploading file.");
  }

  const data: { filename: string } = await resp.data;

  return `${config.imgUploadURL}/${data.filename}`;
};

export { uploadFile };
