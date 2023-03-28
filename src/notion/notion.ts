import { Client } from "@notionhq/client";
import {
  AppendBlockChildrenParameters,
  BlockObjectRequest,
} from "@notionhq/client/build/src/api-endpoints";

class Notion {
  notion: Client;
  blockID: string;

  constructor(notionToken: string, blockID: string) {
    this.blockID = blockID;

    this.notion = new Client({
      auth: notionToken,
    });
  }

  private async apiCall(newChildren: BlockObjectRequest[]) {
    try {
      await this.notion.blocks.children.append({
        block_id: this.blockID,
        children: newChildren,
      });
    } catch (e) {
      throw new Error("Notion API Error");
    }
  }

  async addDivider() {
    await this.apiCall([
      {
        type: "divider",
        divider: {},
      },
    ]);
  }

  async addText(text: string) {
    await this.apiCall([
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

  async addImage(URL: string) {
    await this.apiCall([
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

export { Notion };
