import { Scenes, Telegraf } from "telegraf";
import { MyContext } from "./context";
import { setUserData } from "./storage";

const getPageID = (link: string): string => {
  const regex = /www\.notion\.so\/(\w*\-)*(?<pageID>\w*)\??/;

  const matches = link.match(regex);

  if (matches?.groups) {
    return matches.groups.pageID;
  } else {
    throw new Error("Couldn't parse Notion link");
  }
};

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

      const pageID = getPageID(link);

      ctx.wizard.state.data.webDumpPageID = pageID;

      const userData = ctx.wizard.state.data;
      await setUserData(ctx.userID, userData);

      await ctx.reply(
        "I stored your information. Try to send a message and see if it appears in Notion.\n\
        Verify that it is correct.\n\
        If not, restart the setup with the command /setup.\n" +
          JSON.stringify(userData, null, 2)
      );
      return await ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([superWizard]);
  bot.use(stage.middleware());
};

export { addWizard };
