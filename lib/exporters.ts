import { buildSections, renderLine, voices } from "./voice";
import { versionSlug } from "./semver";
import type { ExportFormat, ReleaseDraft } from "./types";

/* ---------------------------------------------------------------------------
   One draft, seven destinations.

   Every writer consumes the same section tree, so a change to the voice rules
   propagates everywhere at once and the preview can never drift from what the
   export button hands you.
   ------------------------------------------------------------------------ */

function leadFor(draft: ReleaseDraft) {
  const voice = voices[draft.audience];
  const included = draft.items.filter((item) => item.included);
  return voice.lead({
    total: included.length,
    breaking: included.filter((item) => item.breaking || item.type === "breaking")
      .length,
    version: draft.version || "This release",
  });
}

/** Strips markdown emphasis for destinations that do not render it. */
function plain(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal inline markdown to HTML, matching what the preview renders. */
function inlineHtml(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

/**
 * The body of a single site entry: `##` section headings, matching the shape
 * the changelog feed renders. Shared by the live preview, MDX, JSON, and the
 * entries.ts snippet so all four stay identical.
 */
export function buildEntryBody(draft: ReleaseDraft): string {
  const voice = voices[draft.audience];
  const sections = buildSections(draft.items, voice);
  const blocks: string[] = [];

  const summary = draft.summary.trim();
  blocks.push(summary || leadFor(draft));

  for (const section of sections) {
    blocks.push(`## ${section.heading}`);
    const lines = section.items.map((item) => `- ${renderLine(item, voice)}`);
    if (section.overflow > 0) {
      lines.push(`- ...and ${section.overflow} more in this category`);
    }
    blocks.push(lines.join("\n"));
  }

  return blocks.join("\n\n").trim();
}

/** A CHANGELOG.md section: `##` version heading, `###` categories. */
export function toChangelogMarkdown(draft: ReleaseDraft): string {
  const voice = voices[draft.audience];
  const sections = buildSections(draft.items, voice);
  const heading = `## ${draft.version || "Unreleased"}${
    draft.date ? ` - ${draft.date}` : ""
  }`;

  const blocks: string[] = [heading];
  if (draft.title.trim()) blocks.push(`**${draft.title.trim()}**`);

  const summary = draft.summary.trim();
  blocks.push(summary || leadFor(draft));

  for (const section of sections) {
    blocks.push(`### ${section.heading}`);
    const lines = section.items.map((item) => `- ${renderLine(item, voice)}`);
    if (section.overflow > 0) {
      lines.push(`- ...and ${section.overflow} more in this category`);
    }
    blocks.push(lines.join("\n"));
  }

  return `${blocks.join("\n\n")}\n`;
}

function toMdx(draft: ReleaseDraft): string {
  const frontmatter = [
    "---",
    `version: "${draft.version}"`,
    `date: "${draft.date}"`,
    `title: "${draft.title.replace(/"/g, '\\"')}"`,
    `tags: [${draft.tags.map((tag) => `"${tag}"`).join(", ")}]`,
    `highlight: ${draft.highlight}`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n${buildEntryBody(draft)}\n`;
}

function toJson(draft: ReleaseDraft): string {
  return `${JSON.stringify(
    {
      id: versionSlug(draft.version),
      version: draft.version,
      date: draft.date,
      title: draft.title,
      tags: draft.tags,
      highlight: draft.highlight,
      audience: draft.audience,
      content: buildEntryBody(draft),
    },
    null,
    2,
  )}\n`;
}

function toHtml(draft: ReleaseDraft): string {
  const voice = voices[draft.audience];
  const sections = buildSections(draft.items, voice);
  const summary = draft.summary.trim() || leadFor(draft);

  const body = sections
    .map((section) => {
      const items = section.items
        .map(
          (item) =>
            `      <li style="margin:0 0 6px">${inlineHtml(
              renderLine(item, voice),
            )}</li>`,
        )
        .join("\n");
      const overflow =
        section.overflow > 0
          ? `\n      <li style="margin:0 0 6px;opacity:.7">…and ${section.overflow} more</li>`
          : "";
      return [
        `    <h3 style="margin:24px 0 8px;font:600 12px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8b7a67">${escapeHtml(
          section.heading,
        )}</h3>`,
        `    <ul style="margin:0;padding-left:18px;color:#3c3128">`,
        items + overflow,
        `    </ul>`,
      ].join("\n");
    })
    .join("\n");

  return `<article style="max-width:640px;margin:0 auto;font:15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a140f">
  <header>
    <p style="margin:0;font:500 12px/1 ui-monospace,monospace;letter-spacing:.1em;color:#8b7a67">${escapeHtml(
      draft.version,
    )} &middot; ${escapeHtml(draft.date)}</p>
    <h2 style="margin:8px 0 0;font:400 26px/1.25 Georgia,serif;letter-spacing:-.01em">${escapeHtml(
      draft.title,
    )}</h2>
  </header>
  <p style="margin:16px 0 0;color:#4a3d31">${inlineHtml(summary)}</p>
${body}
</article>
`;
}

function toSlack(draft: ReleaseDraft): string {
  const voice = voices[draft.audience];
  const sections = buildSections(draft.items, voice);
  const summary = draft.summary.trim() || leadFor(draft);

  // Slack mrkdwn: single asterisks for bold, no headings, bullet characters.
  const toMrkdwn = (text: string) =>
    plain(text).replace(/\*\*(.+?)\*\*/g, "*$1*");

  const blocks = [
    `*${draft.version}* — ${draft.title}`,
    toMrkdwn(summary),
    ...sections.map((section) => {
      const lines = section.items
        .map((item) => `• ${toMrkdwn(renderLine(item, voice))}`)
        .join("\n");
      const overflow =
        section.overflow > 0 ? `\n• _…and ${section.overflow} more_` : "";
      return `*${section.heading}*\n${lines}${overflow}`;
    }),
  ];

  return `${blocks.join("\n\n")}\n`;
}

function toText(draft: ReleaseDraft): string {
  const voice = voices[draft.audience];
  const sections = buildSections(draft.items, voice);
  const summary = draft.summary.trim() || leadFor(draft);
  const rule = "=".repeat(Math.max(draft.title.length, 24));

  const blocks = [
    `${draft.version}  ${draft.date}`,
    draft.title,
    rule,
    plain(summary),
    ...sections.map((section) => {
      const lines = section.items
        .map((item) => `  - ${plain(renderLine(item, voice))}`)
        .join("\n");
      const overflow =
        section.overflow > 0 ? `\n  - ...and ${section.overflow} more` : "";
      return `${section.heading.toUpperCase()}\n${lines}${overflow}`;
    }),
  ];

  return `${blocks.join("\n\n")}\n`;
}

/**
 * A ready-to-paste entry for lib/entries.ts, written in the same array-join
 * style the file already uses so a paste leaves no diff noise.
 */
function toEntriesSnippet(draft: ReleaseDraft): string {
  const lines = buildEntryBody(draft)
    .split("\n")
    .map((line) => `      ${JSON.stringify(line)},`)
    .join("\n");

  return `  {
    id: ${JSON.stringify(versionSlug(draft.version))},
    version: ${JSON.stringify(draft.version)},
    date: ${JSON.stringify(draft.date)},
    title: ${JSON.stringify(draft.title)},
    tags: [${draft.tags.map((tag) => JSON.stringify(tag)).join(", ")}],${
      draft.highlight ? "\n    highlight: true," : ""
    }
    content: [
${lines}
    ].join("\\n"),
  },
`;
}

export interface ExportMeta {
  id: ExportFormat;
  label: string;
  /** What this output is actually for. */
  blurb: string;
  extension: string;
  /** Syntax hint shown on the output panel. */
  language: string;
}

export const exportFormats: ExportMeta[] = [
  {
    id: "markdown",
    label: "Markdown",
    blurb: "CHANGELOG.md section, Keep a Changelog headings",
    extension: "md",
    language: "markdown",
  },
  {
    id: "mdx",
    label: "MDX",
    blurb: "Frontmatter plus body, for a content-driven site",
    extension: "mdx",
    language: "mdx",
  },
  {
    id: "entries",
    label: "entries.ts",
    blurb: "Paste straight into this repo's lib/entries.ts",
    extension: "ts",
    language: "typescript",
  },
  {
    id: "json",
    label: "JSON",
    blurb: "Structured record for an API or a CMS",
    extension: "json",
    language: "json",
  },
  {
    id: "html",
    label: "HTML",
    blurb: "Inline-styled fragment that survives email clients",
    extension: "html",
    language: "html",
  },
  {
    id: "slack",
    label: "Slack",
    blurb: "mrkdwn message for a #releases channel",
    extension: "txt",
    language: "text",
  },
  {
    id: "text",
    label: "Plain text",
    blurb: "No markup, for terminals and release emails",
    extension: "txt",
    language: "text",
  },
];

export function renderExport(
  draft: ReleaseDraft,
  format: ExportFormat,
): string {
  switch (format) {
    case "markdown":
      return toChangelogMarkdown(draft);
    case "mdx":
      return toMdx(draft);
    case "json":
      return toJson(draft);
    case "html":
      return toHtml(draft);
    case "slack":
      return toSlack(draft);
    case "text":
      return toText(draft);
    case "entries":
      return toEntriesSnippet(draft);
  }
}

export function exportFilename(draft: ReleaseDraft, format: ExportFormat) {
  const meta = exportFormats.find((entry) => entry.id === format);
  const slug = versionSlug(draft.version);
  if (format === "entries") return `${slug}.entry.ts`;
  return `changelog-${slug}.${meta?.extension ?? "txt"}`;
}
