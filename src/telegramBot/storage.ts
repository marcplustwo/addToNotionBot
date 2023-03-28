import storage, { getItem } from "node-persist";

interface UserData {
  notionToken?: string;
  webDumpPageID?: string;
}

const setUpStorage = async () =>
  await storage.init({
    dir: "storage",
  });

const getUserData = async (userID: string): Promise<UserData> => {
  let userData = await storage.getItem(userID);

  if (!userData) {
    storage.setItem(userID, {});

    userData = {};
  }

  return userData as UserData;
};

const setUserData = async (
  userID: string,
  userData: UserData
): Promise<storage.WriteFileResult> => {
  return storage.setItem(userID, userData);
};

export { UserData, setUpStorage, getUserData, setUserData };
