import { config } from "../config";

const uploadFile = async (telegramURL: string): Promise<string> => {
  const resp = await fetch(config.imgUploadURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: telegramURL,
    }),
  });

  if (!resp.ok) {
    throw new Error("Error uploading file.");
  }

  const data: { filename: string } = await resp.json();

  return `${config.imgUploadURL}/${data.filename}`;
};

export { uploadFile };
