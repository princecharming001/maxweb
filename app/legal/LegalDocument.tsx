import fs from "fs/promises";
import path from "path";

function extractWrapHtml(html: string) {
  const match = html.match(/<div class="wrap">([\s\S]*?)<\/div>\s*<\/body>/i);
  return match ? match[1] : html;
}

function stripNavAndFooter(content: string) {
  // Remove the in-document navigation and footer links so users don't have
  // “buttons” to jump between legal screens.
  const withoutNav = content.replace(/<nav\b[\s\S]*?<\/nav>/gi, "");
  return withoutNav.replace(/<footer\b[\s\S]*?<\/footer>/gi, "");
}

function normalizeRelativeLegalLinks(content: string) {
  // Convert relative HTML links (e.g. privacy.html) to Next routes
  // so injected content works from /legal/* pages.
  return content
    .replace(/href="index\.html"/g, 'href="/legal"')
    .replace(/href="privacy\.html"/g, 'href="/legal/privacy"')
    .replace(/href="terms\.html"/g, 'href="/legal/terms"')
    .replace(
      /href="community-guidelines\.html"/g,
      'href="/legal/community-guidelines"'
    )
    .replace(/href="cookies\.html"/g, 'href="/legal/cookies"');
}

export default async function LegalDocument({
  file,
}: {
  file: "index.html" | "terms.html" | "privacy.html" | "community-guidelines.html" | "cookies.html";
}) {
  const publicPath = path.join(process.cwd(), "public", "legal", file);
  const rawHtml = await fs.readFile(publicPath, "utf-8");

  const extracted = extractWrapHtml(rawHtml);
  const cleaned = normalizeRelativeLegalLinks(
    stripNavAndFooter(extracted)
  );

  return (
    <div
      className="max-w-4xl mx-auto prose prose-slate"
      style={{ color: "#1d1d1f" }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
}

