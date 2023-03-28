import { Client } from "@notionhq/client";

class Notion {
  notion: Client;
  blockID: string;

  constructor(notionToken: string, blockID: string) {
    this.blockID = blockID;

    this.notion = new Client({
      auth: notionToken,
    });
  }

  async addText(text: string) {
    await this.notion.blocks.children
      .append({
        block_id: this.blockID,
        children: [
          {
            type: "divider",
            divider: {},
          },
          {
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: text,
                  },
                },
              ],
            },
          },
        ],
      })
      .catch((error) => console.error(error));
  }

  async addImage(URL: string) {
    await this.notion.blocks.children
      .append({
        block_id: this.blockID,
        children: [
          {
            type: "image",
            image: {
              type: "external",
              external: {
                url: URL,
              },
            },
          },
        ],
      })
      .catch((error) => console.error(error));
  }
}

const addText = async (notionToken: string, blockID: string, text: string) => {
  const notion = new Client({
    auth: notionToken,
  });

  await notion.blocks.children
    .append({
      block_id: blockID,
      children: [
        {
          type: "divider",
          divider: {},
        },
        {
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                text: {
                  content: text,
                },
              },
            ],
          },
        },
      ],
    })
    .catch((error) => console.error(error));
};

// addText(
//   "secret_AZDYzGxoeqswK0tmLlXShIIpR5ooRIGSvRHYrpqgPn7",
//   "b1509f8457f34dfd9fe4180682ca35c0",
//   "HI"
// );

export { Notion };
