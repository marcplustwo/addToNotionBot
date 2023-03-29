import { NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import { processText } from "../util/processText";
import { uploadFile } from "../util/uploadFile";
import { MyContext } from "./context";

const handleMessage = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  const message = ctx.update.message;

  var text: string = "";
  var imgURL: string | undefined;

  if ("text" in message) {
    text = message.text;
  } else if ("photo" in message) {
    const file = await ctx.telegram.getFileLink(
      message.photo.slice(-1)[0].file_id
    );

    text = message.caption || "Image";
    imgURL = await uploadFile(file.href);
  }

  const textObj = processText(text);

  const page = await ctx.notion.addPageToDatabase(textObj, imgURL);
  await ctx.notion.addToPage(page.id, textObj, imgURL);

  return page.url;
};

const onMessage = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  try {
    const pageURL = await handleMessage(ctx);
    await ctx.reply(`Added a new page for you: ${pageURL}`);
  } catch (error) {
    console.error(error);
    await ctx.reply(("Error: " + error) as string);
  }
};

export { onMessage };
