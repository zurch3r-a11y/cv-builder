/** 
 * Lightweight HTML sanitizer: strips script/style tags and dangerous attributes.
 * Content is produced by TipTap (trusted), but this guards against
 * any future API tampering.
 */
function sanitizeHtml(html: string): string {
  return html
    // Remove <script> and <style> blocks (and their contents)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove dangerous event attributes (on*), quoted or unquoted
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Remove javascript:/data: hrefs or srcs, quoted or unquoted
    .replace(/\s+(href|src)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (match, attr, val) => {
      const unquoted = val.replace(/^["']|["']$/g, "").trim();
      return /^\s*(javascript|data):/i.test(unquoted) ? "" : match;
    });
}

/** 
 * Heuristic to detect TipTap-generated HTML.
 * TipTap always wraps content in block elements; plain text never starts with '<p>'.
 * Using a tag-name check avoids misclassifying text that literally starts with '<'.
 */
function isHtmlContent(text: string): boolean {
  const trimmed = text.trim();
  // Must start with an opening HTML tag (e.g., <p>, <ul>, <ol>)
  return /^<(p|ul|ol|h[1-6]|div|br)\b/i.test(trimmed);
}

/** Render a description field that may be plain text or TipTap HTML */
export function renderDescription(text: string, extraClass = "") {
  if (!text) return null;
  if (isHtmlContent(text)) {
    return (
      <div
        className={`prose prose-sm max-w-none text-inherit [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0 [&_p]:my-0 [&_p+p]:mt-1 ${extraClass}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
      />
    );
  }
  return (
    <p className={`whitespace-pre-wrap ${extraClass}`}>{text}</p>
  );
}

/**
 * Render a short field (e.g. school/company name) that may be plain text or
 * single-line TipTap HTML, inline (no wrapping block element), so it can sit
 * alongside other text like a city or date in the same line.
 */
export function renderInline(text: string, extraClass = "") {
  if (!text) return null;
  if (isHtmlContent(text)) {
    const trimmed = sanitizeHtml(text).trim();
    // Only <p> (optionally with attributes, e.g. text-align styles) is safe
    // to unwrap into an inline context. Any other block root (ul/ol/div/
    // heading) can't be flattened into a <span> without becoming invalid
    // HTML, so fall back to plain text for those rather than risk broken
    // markup or nested block elements inside inline content.
    if (!/^<p\b[^>]*>[\s\S]*<\/p>\s*$/i.test(trimmed)) {
      return <span className={extraClass}>{stripTags(trimmed)}</span>;
    }
    const unwrapped = trimmed
      // Drop the opening tag of the first paragraph and closing tag of the last
      .replace(/^<p\b[^>]*>/i, "")
      .replace(/<\/p>\s*$/i, "")
      // Collapse any remaining paragraph boundaries (multi-line content) into breaks
      .replace(/<\/p>\s*<p\b[^>]*>/gi, "<br/>");
    return (
      <span
        className={extraClass}
        dangerouslySetInnerHTML={{ __html: unwrapped }}
      />
    );
  }
  return <span className={extraClass}>{text}</span>;
}

/** Strip all HTML tags, leaving plain text (used as a safe inline fallback). */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
