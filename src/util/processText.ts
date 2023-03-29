interface TextObject {
  text: string;
  title: string;
  links?: string[];
  tags?: string[];
}

const processText = (text: string): TextObject => {
  const title = text.split("\n")[0];

  const regexLink = /(?<link>https?:\/\/[^\s]+)/gm;
  const links = text.match(regexLink);

  const regexTags = /(?<tag>\@\w*)/gm;
  const tags = text.match(regexTags);

  return {
    text,
    title,
    tags: tags ? tags : undefined,
    links: links ? links : undefined,
  };
};

export { processText, TextObject };
