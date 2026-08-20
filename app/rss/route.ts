import { NextResponse } from "next/server";
import { entries } from "@/lib/entries";

const BASE = "https://changelog.javiertpadilla.com";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** CDATA cannot contain the closing sequence; split it if the body ever does. */
function cdata(value: string) {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export function GET() {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items = sorted
    .map((entry) => {
      const link = `${BASE}/#${entry.id}`;
      const categories = entry.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(`${entry.version} - ${entry.title}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(`${entry.date}T12:00:00Z`).toUTCString()}</pubDate>
${categories}
      <description>${cdata(entry.content)}</description>
    </item>`;
    })
    .join("\n");

  const latest = sorted[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Changelog Studio</title>
    <link>${BASE}</link>
    <description>Release notes, published as they ship.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${latest.date}T12:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
