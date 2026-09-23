const services = [
  {
    title: "Ocean Freight",
    subtitle: "SEA MOVEMENT",
    lead: "Reliable shipping performance from origin to destination, backed by a strong global carrier network.",
    header: "KEY CAPABILITIES",
    badges: ["Multimodal cargo planning", "FCL & LCL container support", "Global route distribution"],
    footer: "Ocean freight keeps every transfer visible while cargo moves across international waters.",
    action: "Explore Ocean Freight",
  },
  {
    title: "Air Freight",
    subtitle: "TIME CRITICAL",
    lead: "Speed, precision, and reliability for businesses that cannot afford delays across global destinations.",
    header: "SERVICE HIGHLIGHTS",
    badges: ["Express priority air cargo", "Temperature-controlled handling", "Guaranteed charter allocation"],
    footer: "Air freight ensures time-sensitive shipments arrive safely without delaying critical timelines.",
    action: "Explore Air Freight",
  },
  {
    title: "Customs Clearance",
    subtitle: "CLEARANCE DESK",
    lead: "Simplifying international trade through full regulatory compliance and efficient cargo movement.",
    header: "BORDER COMPLIANCE",
    badges: ["Import & export clearance", "Duty classification support", "Proactive customs filing"],
    footer: "Customs compliance keeps your shipments moving smoothly across international borders.",
    action: "Explore Customs",
  },
  {
    title: "Warehousing & Logistics",
    subtitle: "LOCAL CONTROL",
    lead: "Keeping your supply chain efficient, connected, and responsive through end-to-end warehouse support.",
    header: "STORAGE & TRANSPORT",
    badges: ["Secure inventory management", "Inland transport dispatch", "Fulfillment & distribution"],
    footer: "Integrated warehousing maintains operational control from facility storage to final destination.",
    action: "Explore Warehousing",
  },
  {
    title: "Specialized Logistics",
    subtitle: "COMPLEX CARGO",
    lead: "Planning-led freight support for oversized, sensitive, and non-standard project cargo.",
    header: "PROJECT HANDOVER",
    badges: ["Heavy-lift route planning", "Specialized equipment selection", "On-site project coordination"],
    footer: "Specialized logistics handles non-standard cargo with technical precision and safety.",
    action: "Explore Project Cargo",
  },
];

const serviceContent = /(<div class="left"><div class="title-content">)[\s\S]*?(<\/ul><\/div>)/g;

// Small line icons follow each capability's meaning; the parent text remains the accessible label.
const capabilityIcons = [
  ["M3 17 8 7l4 6 3-4 6 8", "M3 20h18"], // route planning
  ["M3 7h18v10H3z", "M9 7v10m6-10v10"], // containers
  ["M3 12h18", "m15 6 6 6-6 6", "M4 7l3-3 3 3M4 17l3 3 3-3"], // distribution
  ["M3 13h12l4-4 2 1-2 6H6z", "M6 19h12"], // aircraft
  ["M8 3h8v18H8z", "M10 8h4m-4 4h4m-4 4h4"], // controlled handling
  ["M3 8h18v9H3z", "M7 8V5h10v3", "M7 13h10"], // charter allocation
  ["M4 4h12l4 4v12H4z", "M16 4v4h4", "M8 13h8m-8 4h6"], // clearance documents
  ["M4 5h16v14H4z", "M8 9h8m-8 4h6"], // classification
  ["M5 12l4 4L19 6", "M4 4h16v16H4z"], // filing
  ["M4 7h16v13H4z", "M4 11h16", "M9 15h6"], // inventory
  ["M3 8h11v9H3z", "M14 11h4l3 3v3h-7z", "M6 19h2m10 0h2"], // transport
  ["M4 6h16v12H4z", "m8 9 4 3 4-3", "M12 12v6"], // fulfillment
  ["M4 19h16", "M7 16V8h10v8", "M12 8V3", "m9 6 3-3 3 3"], // heavy lift
  ["M4 8h16v10H4z", "M8 8V5h8v3", "M8 13h8"], // equipment
  ["M4 20V7l8-4 8 4v13", "M8 20v-8h8v8"], // on-site work
];

function capabilityIcon(index: number): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${capabilityIcons[index].map((path) => `<path d="${path}"/>`).join("")}</svg>`;
}

export function withHomepageServices(bodyHtml: string): string {
  const start = bodyHtml.indexOf('<div class="module module-expertises-list"');
  const end = bodyHtml.indexOf('<div class="module-full module-homepage-interactive-image"', start);
  if (start < 0 || end < 0) return bodyHtml;

  const original = bodyHtml.slice(start, end);
  let count = 0;
  const updated = original.replace(serviceContent, (_match, opening: string) => {
    const service = services[count];
    if (!service) return _match;
    const number = String(++count).padStart(2, "0");
    const badges = service.badges.map((badge, index) =>
      `<li><span class="sf-service-badge">${capabilityIcon((count - 1) * 3 + index)}</span><span class="sf-service-badge-label">${badge}</span></li>`
    ).join("");
    return `${opening}<span class="caption">${number}</span><h2 class="title">${service.title}</h2><span class="sf-service-subtitle">${service.subtitle}</span><p class="description">${service.lead}</p></div><span class="sf-service-header">${service.header}</span><ul class="bullet-list">${badges}</ul><p class="sf-service-footer">${service.footer}</p><a href="/en/expertises-en/" class="cta-custom sf-service-cta"><div class="cta-custom-content"><div class="cta-custom-wrapper"><p class="text"><span>${service.action}</span></p><div class="cta-custom-arrows-wrapper"><div class="icon icon-arrow-right"></div><div class="icon icon-arrow-right absolute"></div></div></div></div></a></div>`;
  });

  return count === services.length
    ? bodyHtml.slice(0, start) + updated.replace('class="module module-expertises-list"', 'id="sf-home-services" class="module module-expertises-list"') + bodyHtml.slice(end)
    : bodyHtml;
}
