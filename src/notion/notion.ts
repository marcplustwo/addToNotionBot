import { Client } from "@notionhq/client";
import {
  BlockObjectRequest,
  deleteBlock,
} from "@notionhq/client/build/src/api-endpoints";

class Notion {
  private notion: Client;
  pageID: string;

  constructor(notionToken: string, pageID: string) {
    this.pageID = pageID;

    this.notion = new Client({
      auth: notionToken,
    });
  }

  private async appendToPage(
    pageID: string,
    newChildren: BlockObjectRequest[]
  ) {
    try {
      await this.notion.blocks.children.append({
        block_id: pageID,
        children: newChildren,
      });
    } catch (e) {
      console.error(e);
      throw new Error("Notion API Error");
    }
  }

  async addPageToDatabase(title: string) {
    return this.notion.pages.create({
      parent: {
        type: "database_id",
        database_id: this.pageID,
      },
      properties: {
        Name: {
          type: "title",
          title: [{ type: "text", text: { content: title } }],
        },
      },
    });
  }

  async addTextToPage(pageID: string, text: string) {
    await this.appendToPage(pageID, [
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
    ]);
  }

  async addImageToPage(pageID: string, URL: string) {
    await this.appendToPage(pageID, [
      {
        type: "image",
        image: {
          type: "external",
          external: {
            url: URL,
          },
        },
      },
    ]);
  }
}

// const main = async () => {
//   const notion = new Notion();

//   const page = await notion.addPageToDatabase("dsadsa");
//   console.log(page);

//   const t = await notion.addTextToPage(
//     page.id,
//     "https://www.google.com/search?client=firefox-b-d&q=notion+api+add+to+database"
//   );
//   console.log(t);
// };

// main();

export { Notion };
