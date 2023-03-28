import * as dotenv from "dotenv";

interface Config {
  telegramBotToken: string;
  imgUploadURL: string;
}

dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error("Add TELEGRAM_BOT_TOKEN to .env file");
  process.exit();
}

if (!process.env.IMG_UPLOAD_URL) {
  console.error("Add IMG_UPLOAD_URL to .env file");
  process.exit();
}

const config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  imgUploadURL: process.env.IMG_UPLOAD_URL,
};

export { config };
