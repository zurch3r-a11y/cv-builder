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
    // Remove dangerous event attributes (on*)
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    // Remove javascript: and data: hrefs/srcs
    .replace(/\s+(href|src)\s*=\s*["']\s*(?:javascript|data):[^"']*["']/gi, "");
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
