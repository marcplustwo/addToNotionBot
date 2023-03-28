import { Context, Scenes } from "telegraf";
import { Notion } from "../notion/notion";
import { UserData } from "./storage";

interface MyContext extends Context {
  userData?: UserData;
  userID?: string;
  scene: Scenes.SceneContextScene<MyContext>;
  notion: Notion;
}

export { MyContext };
