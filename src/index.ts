import { setupBot } from "./telegramBot/setup";

setupBot().then((bot) => bot.launch());
