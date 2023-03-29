import { Telegraf, session } from "telegraf";
import { config } from "../config";
import { Notion } from "../notion/notion";
import { MyContext } from "./context";
import { onMessage } from "./handleMessage";
import { getUserData, setUpStorage } from "./storage";
import { addWizard } from "./wizard";

const PROMPT_TEXT = `
*AddToNotionBot*
I am your addToNotionBot I can add resources directly into your Notion page
To know which Notion account and page to add to, I need some information from you

__Preparation__
Step 1:
I need a "Internal Integration Token"
Go to [My Integrations](https://www\\.notion\\.so/my\\-integrations) and create an Integration
I will ask for the "Internal Integration Token" shortly

Step 2:
This Bot creates pages in a Database. You need to Create a *(full-page) database with the propertier: _Name, URL, Tags, Image_*

Step 3:
Go to the page you want to use as a WebDump, go to settings 
Then you need to add the connection to the connection you created in Step 1
Next, you have to send me the page link, so I know, where to add your links

These steps are explained again here:
[Create a Notion Integration](https://developers\\.notion\\.com/docs/create\\-a\\-notion\\-integration)

__Setup__
Use the command \`r/setup\` to enter the necessary details

__Help__
Use the command \`help\` to show this message
`;

const setupBot = async (): Promise<Telegraf<MyContext>> => {
  await setUpStorage();

  const bot = new Telegraf<MyContext>(config.telegramBotToken);

  const hasUserInfo = (ctx: MyContext): boolean => {
    return !!ctx.userData?.notionToken && !!ctx.userData.webDumpPageID;
  };

  // register middlewares
  bot.use(session());
  bot.use(async (ctx, next) => {
    // inject user data into context
    const userID = ctx.from?.id.toString() || "";
    const userData = await getUserData(userID);

    ctx.userID = userID;
    ctx.userData = userData;

    ctx.notion = new Notion(
      ctx.userData.notionToken || "",
      ctx.userData.webDumpPageID || ""
    );

    return next();
  });

  addWizard(bot);

  // commands
  bot.command("setup", async (ctx) => {
    await ctx.scene.enter("setup");
  });

  bot.command("start", async (ctx) => {
    await ctx.replyWithMarkdownV2(PROMPT_TEXT);
    if (!hasUserInfo(ctx)) {
      await ctx.scene.enter("setup");
    }
  });

  bot.command("help", async (ctx) => {
    await ctx.replyWithMarkdownV2(PROMPT_TEXT);
    if (!hasUserInfo(ctx)) {
      await ctx.scene.enter("setup");
    }
  });
  bot.command("info", async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.userData));
  });

  bot.use(async (ctx, next) => {
    if (!hasUserInfo(ctx)) {
      await ctx.scene.enter("setup");
    }

    return next();
  });

  bot.on("message", (ctx) => onMessage(ctx));

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};

export { setupBot };
