import * as dotenv from "dotenv";
import { setupBot } from "./telegramBot/bot";

dotenv.config();

setupBot(process.env.TELEGRAM_BOT_TOKEN || "").then((bot) => bot.launch());
