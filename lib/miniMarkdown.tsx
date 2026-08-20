import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   A small markdown renderer for the studio's live preview.

   The public feed renders entries through MDX on the server. The preview needs
   the same output with zero latency while the author types, so it re-renders
   the subset of markdown the generator can actually emit — headings, lists,
   fences, and inline emphasis — into the same .changelog-prose styles. Same
   CSS in, same picture out.
   ------------------------------------------------------------------------ */

const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE_RE).filter((part) => part !== "");

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 3) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return (
        <a
          key={key}
          href={link[2]}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {link[1]}
        </a>
      );
    }

    return <span key={key}>{part}</span>;
  });
}

type Block =
  | { kind: "h2" | "h3" | "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "code"; text: string; lang: string };

function toBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;
  let fence: { lang: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    const fenceMatch = /^```(\w*)/.exec(line.trim());

    if (fence) {
      if (fenceMatch) {
        blocks.push({
          kind: "code",
          text: fence.lines.join("\n"),
          lang: fence.lang,
        });
        fence = null;
      } else {
        fence.lines.push(line);
      }
      continue;
    }

    if (fenceMatch) {
      flushAll();
      fence = { lang: fenceMatch[1] || "", lines: [] };
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      blocks.push({
        kind: heading[1].length === 2 ? "h2" : "h3",
        text: heading[2].trim(),
      });
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (list?.kind !== "ul") {
        flushList();
        list = { kind: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      if (list?.kind !== "ol") {
        flushList();
        list = { kind: "ol", items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  // An unterminated fence still renders — the author is probably mid-typing.
  if (fence) {
    blocks.push({ kind: "code", text: fence.lines.join("\n"), lang: fence.lang });
  }
  flushAll();

  return blocks;
}

export default function Markdown({ source }: { source: string }) {
  const blocks = toBlocks(source);

  return (
    <>
      {blocks.map((block, index) => {
        const key = `b-${index}`;

        switch (block.kind) {
          case "h2":
            return <h2 key={key}>{renderInline(block.text, key)}</h2>;
          case "h3":
            return <h3 key={key}>{renderInline(block.text, key)}</h3>;
          case "p":
            return <p key={key}>{renderInline(block.text, key)}</p>;
          case "code":
            return (
              <pre key={key} data-lang={block.lang || undefined}>
                <code>{block.text}</code>
              </pre>
            );
          case "ul":
            return (
              <ul key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>
                    {renderInline(item, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>
                    {renderInline(item, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </ol>
            );
        }
      })}
    </>
  );
}
