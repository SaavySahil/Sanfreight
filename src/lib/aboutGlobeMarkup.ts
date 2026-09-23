export function withAboutGlobeMount(bodyHtml: string): string {
  const start = bodyHtml.indexOf('<div class="module module-projects-map network-globe-section"');
  const next = bodyHtml.indexOf('<div class="module module-text-and-caption split-text about-page', start);
  if (start < 0 || next < 0) return bodyHtml;

  const openEnd = bodyHtml.indexOf(">", start) + 1;
  const openingTag = bodyHtml.slice(start, openEnd);
  return `${bodyHtml.slice(0, start)}${openingTag}<div id="sf-image-globe-root"></div></div>${bodyHtml.slice(next)}`;
}
