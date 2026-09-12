import type { MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { Prompt } from "./Prompt";
import { ListItem, Worksheet } from "./Worksheet";

export const mdxComponents: MDXComponents = {
  Prompt,
  Worksheet,
  Callout,
  li: ListItem,
};
