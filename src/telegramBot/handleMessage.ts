import { text } from "stream/consumers";
import { NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import { config } from "../config";
import { Notion } from "../notion/notion";
import { processText } from "../util/processText";
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

const handleText = async (notion: Notion, text: string) => {
  const textObj = processText(text);
  const page = await notion.addPageToDatabase(textObj);

  await notion.addTextToPage(page.id, textObj);

  return page.url;
};

const handlePhoto = async (
  notion: Notion,
  photoURL: string,
  caption?: string
) => {
  const textObj = processText(caption || "Screenshot");

  const page = await notion.addPageToDatabase(textObj);

  const newURL = await uploadFile(photoURL);
  await notion.addImageToPage(page.id, newURL);

  return page.url;
};

const handleMessage = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  const message = ctx.update.message;

  if ("text" in message) {
    return await handleText(ctx.notion, message.text);
  } else if ("photo" in message) {
    const file = await ctx.telegram.getFileLink(
      message.photo.slice(-1)[0].file_id
    );

    return await handlePhoto(ctx.notion, file.href, message.caption);
  }
  // handle document
  // if ("document" in message) {
  //   file = await ctx.telegram.getFileLink(message.document.file_id);
  // }
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
