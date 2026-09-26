const solutions = [
  ["Ocean Freight", "Reliable FCL and LCL shipping across global trade routes.", "nav-service-1.webp"],
  ["Air Freight", "Time-critical air cargo with dependable global reach.", "nav-service-7.webp"],
  ["Customs Clearance", "Compliant import and export clearance without avoidable delays.", "nav-service-6.webp"],
  ["Warehousing & Logistics", "Secure storage, inland transport and responsive distribution.", "nav-service-3.webp"],
  ["Specialized Logistics", "Expert handling for oversized and complex project cargo.", "nav-service-4.webp"],
] as const;

const esgImageFallbacks: Record<string, string> = {
  "/wp-content/uploads/2023/09/logo1.png": "/images/slider-1.png",
  "/wp-content/uploads/2023/09/logo2.png": "/images/slider-2.png",
  "/wp-content/uploads/2023/09/logo3.png": "/images/slider-3.png",
  "/wp-content/uploads/fly-images/8619/ESG-1920x1080-c.png": "/images/MIMCO-Corporate-ESG-1920x1080-c.png",
  "/wp-content/uploads/fly-images/8619/ESG-562x1218-c.png": "/images/MIMCO-Corporate-ESG-562x1218-c.png",
  "/wp-content/uploads/fly-images/8474/Critères-ESG-1080x1920-c.png": "/images/expertises-ocean-freight.webp",
  "/wp-content/uploads/fly-images/8474/Critères-ESG-655x860-c.png": "/images/expertises-ocean-freight.webp",
  "/wp-content/uploads/fly-images/8475/sawyer-bengtson-umRPY9w3q1c-unsplash-scaled-1080x1920-c.jpg": "/images/expertises-air-freight.webp",
  "/wp-content/uploads/fly-images/8475/sawyer-bengtson-umRPY9w3q1c-unsplash-scaled-655x860-c.jpg": "/images/expertises-air-freight.webp",
  "/wp-content/uploads/fly-images/8476/performance-durable-1080x1920-c.png": "/images/expertises-customs.webp",
  "/wp-content/uploads/fly-images/8476/performance-durable-655x860-c.png": "/images/expertises-customs.webp",
  "/wp-content/uploads/fly-images/8479/gestion-engagée-des-actifs-1080x1920-c.png": "/images/expertises-warehousing.webp",
  "/wp-content/uploads/fly-images/8479/gestion-engagée-des-actifs-640x840-c.png": "/images/expertises-warehousing.webp",
  "/wp-content/uploads/fly-images/8481/sourcing-de-projets-1080x1920-c.png": "/images/expertises-specialized.webp",
  "/wp-content/uploads/fly-images/8481/sourcing-de-projets-640x840-c.png": "/images/expertises-specialized.webp",
  "/wp-content/uploads/fly-images/8486/engagement-écoresponsable-1-1080x1920-c.png": "/images/career-2.webp",
  "/wp-content/uploads/fly-images/8486/engagement-écoresponsable-1-640x840-c.png": "/images/career-2.webp",
  "/wp-content/uploads/fly-images/8488/investissements-responsables-1-1080x1920-c.png": "/images/career-3.webp",
  "/wp-content/uploads/fly-images/8488/investissements-responsables-1-640x840-c.png": "/images/career-3.webp",
};

export function withSolutionsNav(html: string): string {
  const opening = '<div class="slideshow-wrapper embla__container">';
  const ending = '</div></div><div class="progress-w">';
  const slides = solutions.map(([title, description, image]) =>
    `<div class="slide embla__slide" style="pointer-events:none;cursor:default;"><div class="image-wrapper"><img src="/images/${image}" class="picture image" loading="lazy" alt="${title}" draggable="false"/></div><div class="content"><div class="top"><h3 class="title ts-xl">${title}</h3><p class="investment-description ts-xs">${description}</p></div><div class="bottom-content"><div><i class="icon icon-subscription-fund"></i></div><p>SanFreight Logistics</p></div></div></div>`
  ).join("");

  // ESG is now a live route: restore its navigation links across desktop,
  // mobile and footer markup imported from the legacy page snapshots.
  let result = html.replaceAll('data-disabled-href="/en/esg/"', 'href="/en/esg/"');
  for (const [missing, fallback] of Object.entries(esgImageFallbacks)) {
    result = result.replaceAll(missing, fallback);
  }
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
