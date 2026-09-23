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
      `<li><span class="sf-service-badge">${String(index + 1).padStart(2, "0")}</span><span class="sf-service-badge-label">${badge}</span></li>`
    ).join("");
    return `${opening}<span class="caption">${number}</span><h2 class="title">${service.title}</h2><span class="sf-service-subtitle">${service.subtitle}</span><p class="description">${service.lead}</p></div><span class="sf-service-header">${service.header}</span><ul class="bullet-list">${badges}</ul><p class="sf-service-footer">${service.footer}</p><a href="/en/expertises-en/" class="cta-custom sf-service-cta"><div class="cta-custom-content"><div class="cta-custom-wrapper"><p class="text"><span>${service.action}</span></p><div class="cta-custom-arrows-wrapper"><div class="icon icon-arrow-right"></div><div class="icon icon-arrow-right absolute"></div></div></div></div></a></div>`;
  });

  return count === services.length
    ? bodyHtml.slice(0, start) + updated.replace('class="module module-expertises-list"', 'id="sf-home-services" class="module module-expertises-list"') + bodyHtml.slice(end)
    : bodyHtml;
}
