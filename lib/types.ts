export type TagType = "feature" | "fix" | "breaking" | "improved" | "security";

export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  tags: TagType[];
  content: string;
  highlight?: boolean;
}
