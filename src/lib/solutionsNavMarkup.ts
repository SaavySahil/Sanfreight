const solutions = [
  ["Ocean Freight", "Reliable FCL and LCL shipping across global trade routes.", "expertises-ocean-freight.webp"],
  ["Air Freight", "Time-critical air cargo with dependable global reach.", "expertises-air-freight.webp"],
  ["Customs Clearance", "Compliant import and export clearance without avoidable delays.", "expertises-customs.webp"],
  ["Warehousing & Logistics", "Secure storage, inland transport and responsive distribution.", "expertises-warehousing.webp"],
  ["Specialized Logistics", "Expert handling for oversized and complex project cargo.", "expertises-specialized.webp"],
] as const;

export function withSolutionsNav(html: string): string {
  const opening = '<div class="slideshow-wrapper embla__container">';
  const ending = '</div></div><div class="progress-w">';
  const slides = solutions.map(([title, description, image]) =>
    `<div class="slide embla__slide" style="pointer-events:none;cursor:default;"><div class="image-wrapper"><img src="/images/${image}" class="picture image" loading="lazy" alt="${title}" draggable="false"/></div><div class="content"><div class="top"><h3 class="title ts-xl">${title}</h3><p class="investment-description ts-xs">${description}</p></div><div class="bottom-content"><div><i class="icon icon-subscription-fund"></i></div><p>SanFreight Logistics</p></div></div></div>`
  ).join("");

  let result = html;
  let from = 0;
  while (true) {
    const start = result.indexOf(opening, from);
    if (start < 0) break;
    const end = result.indexOf(ending, start);
    if (end < 0) break;
    result = result.slice(0, start) + opening + slides + result.slice(end);
    from = start + opening.length + slides.length + ending.length;
  }
  return result;
}
