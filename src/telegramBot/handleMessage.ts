import { NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import { config } from "../config";
import { MyContext } from "./context";

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

const handleFile = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  const message = ctx.update.message;
  console.log(ctx.update.message);

  // handle images
  var file: URL | null = null;
  if ("document" in message) {
    file = await ctx.telegram.getFileLink(message.document.file_id);
  }
  if ("photo" in message) {
    file = await ctx.telegram.getFileLink(message.photo.slice(-1)[0].file_id);
  }
  if (file) {
    const newURL = await uploadFile(file.href);
    await ctx.notion.addImage(newURL);
  }

  if ("caption" in message) {
    // handle caption
    // message.text;
    // ctx.notion.addText(message.text);
  }
  if ("text" in message) {
    // handle text
    await ctx.notion.addText(message.text);
  }

  await ctx.notion.addDivider();
};

const onMessage = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  // try {
  await handleFile(ctx);
  await ctx.reply("Added.");
  // } catch (error) {
  //   await ctx.reply(("Error: " + error) as string);
  // }
};

export { onMessage };
