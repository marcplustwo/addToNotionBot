import { Client } from "@notionhq/client";
import {
  BlockObjectRequest,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { TextObject } from "../util/processText";

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

  async getPage(pageID: string) {
    return this.notion.blocks.children.list({
      block_id: pageID,
    });
  }

  async addPageToDatabase(
    textObj: TextObject,
    imgURL?: string
  ): Promise<PageObjectResponse> {
    const pageProperties: any = {
      Name: {
        type: "title",
        title: [{ type: "text", text: { content: textObj.title } }],
      },
    };

    if (imgURL)
      pageProperties.Image = {
        files: [
          {
            type: "external",
            name: "Image",
            external: {
              url: imgURL,
            },
          },
        ],
      };

    if (textObj.links)
      pageProperties.URL = {
        url: textObj.links[0],
      };

    if (textObj.tags)
      pageProperties.Tags = {
        multi_select: textObj.tags.map((tag) => ({
          name: tag,
        })),
      };

    return this.notion.pages.create({
      parent: {
        type: "database_id",
        database_id: this.pageID,
      },
      properties: pageProperties,
    }) as Promise<PageObjectResponse>;
  }

  async addToPage(pageID: string, textObj: TextObject, imgURL?: string) {
    const blocks: any = [];

    if (imgURL)
      blocks.push({
        type: "image",
        image: {
          type: "external",
          external: {
            url: imgURL,
          },
        },
      });

    if (textObj.links)
      blocks.push(
        ...textObj.links.map((link) => ({
          type: "bookmark",
          bookmark: {
            url: link,
          },
        }))
      );

    blocks.push({
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            text: {
              content: textObj.text,
            },
          },
        ],
      },
    });

    await this.appendToPage(pageID, blocks);
  }
}

// const main = async () => {
//   const notion = new Notion(
//     ""
//   );

//   const page = await notion.getPage();
//   // console.log(page);

//   // const t = await notion.addTextToPage(
//   //   page.id,
//   //   "https://www.google.com/search?client=firefox-b-d&q=notion+api+add+to+database"
//   // );
//   // console.log(t);
// };

// main();

export { Notion };
