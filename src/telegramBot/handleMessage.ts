import { NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import { config } from "../config";
import { Notion } from "../notion/notion";
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

const handleMessage = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  const message = ctx.update.message;
  console.log(ctx.update.message);

  if ("text" in message) {
    // handle text
    // await ctx.notion.addText(message.text);

    const text = message.text;
    const title = text.split("\n")[0];
    const body = text.split("\n").splice(1).join("\n");

    const regex = /https?:\/\/[^\s]+/;
    const link = body.match(regex);

    const page = await ctx.notion.addPageToDatabase(title);
    // await ctx.notion.addLinkToPage(page.id, link);
    await ctx.notion.addTextToPage(page.id, body);
    return;
  }

  const page =
    "caption" in message
      ? await ctx.notion.addPageToDatabase(message.caption || "")
      : await ctx.notion.addPageToDatabase("Screenshot");

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
    await ctx.notion.addImageToPage(page.id, newURL);
  }
};

const onMessage = async (
  ctx: NarrowedContext<MyContext, Update.MessageUpdate<Message>>
) => {
  try {
    await handleMessage(ctx);
    await ctx.reply("Added.");
  } catch (error) {
    await ctx.reply(("Error: " + error) as string);
  }
};

export { onMessage };
