import { Scenes, Telegraf } from "telegraf";
import { MyContext } from "./context";
import { setUserData } from "./storage";

const addWizard = (bot: Telegraf<MyContext>) => {
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
};

export { addWizard };
