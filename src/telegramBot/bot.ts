import { Telegraf, Context, Scenes, session } from "telegraf";
import { Notion } from "../notion/notion";
import { getUserData, setUpStorage, setUserData, UserData } from "./storage";

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

interface MyContext extends Context {
  userData?: UserData;
  userID?: string;
  scene: Scenes.SceneContextScene<MyContext>;
  notion: Notion;
}

const setupBot = async (
  TELEGRAM_BOT_TOKEN: string
): Promise<Telegraf<MyContext>> => {
  await setUpStorage();

  const bot = new Telegraf<MyContext>(TELEGRAM_BOT_TOKEN);

  const hasUserInfo = (ctx: MyContext): boolean => {
    return !!ctx.userData?.notionToken && !!ctx.userData.webDumpPageID;
  };

  // register middlewares
  bot.use(session());
  bot.use(async (ctx, next) => {
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

  // wizard
  const superWizard = new Scenes.WizardScene(
    "setup",
    async (ctx) => {
      await ctx.reply("What's your 'Internal Integration Token' from Notion?");
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },
    async (ctx) => {
      ctx.wizard.state.data.notionToken = ctx.message.text;
      await ctx.reply("What is the link for the Notion Page you want to use?");
      return ctx.wizard.next();
    },
    async (ctx) => {
      const link: string = ctx.message.text;

      const webDumpPageID = link.split("-").slice(-1)[0];

      ctx.wizard.state.data.webDumpPageID = webDumpPageID;

      const userData = ctx.wizard.state.data;
      await setUserData(ctx.userID, userData);

      await ctx.reply(
        "I stored your information. Try to send a message and see if it appears in Notion."
      );
      return await ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([superWizard]);
  bot.use(stage.middleware());

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

  bot.on("message", async (ctx) => {
    const message = ctx.update.message;
    console.log(ctx.update.message);

    if ("document" in message) {
      // handle file
      const file = await ctx.telegram.getFileLink(message.document.file_id);
      // console.log(file);

      ctx.notion.addImage(file.href);
    }

    if ("photo" in message) {
      const file = await ctx.telegram.getFileLink(
        message.photo.slice(-1)[0].file_id
      );
      // console.log(file);

      ctx.notion.addImage(file.href);
    }

    if ("caption" in message) {
      // handle caption
    }

    if ("text" in message) {
      // handle text
      message.text;
      ctx.notion.addText(message.text);
    }
  });

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
};

export { setupBot };
