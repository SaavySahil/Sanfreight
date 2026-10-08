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
  const esgCopy: Array<[string, string]> = [
    ["Creating value makes perfect sense.", "Moving goods responsibly.<br>Building a better future."],
    ["Access our documents", "Our ESG approach"],
    ["We firmly believe that sustainable value creation goes hand in hand with a responsible investment approach.", "We believe responsible logistics is fundamental to creating lasting value for our customers, our people and the communities we operate in."],
    ["We are convinced that financial performance and environmental and social impact are closely linked.", "We believe operational excellence and responsible logistics go hand in hand."],
    ["Active integration of ESG criteria", "Responsible logistics, built into the way we operate"],
    ["We are aware of the significant impact of real estate on the environment and the importance of social and governance issues in any meaningful and sustainable investment strategy. Therefore, we are committed to acting as a responsible investor and minimizing the effects of operating our real estate assets.<br />\r\n<br />\r\nSanfreight supports global sustainability and is committed to actively integrating Environmental, Social, and Governance dimensions into the management of its assets.", "Responsibility guides how we manage freight, customs, warehousing and specialized cargo. We improve efficiency, strengthen processes and maintain dependable standards throughout every stage of the logistics journey.<br><br>Regular audits, employee development and close partner coordination support this commitment. Together, they help us operate responsibly while delivering the reliability, visibility and care our customers expect."],
    ["The links between performance and impact", "The connection between performance and responsibility"],
    ["At Sanfreight, we firmly believe that financial performance and environmental and social impact are inherently linked.<br />\r\n<br />\r\nWe are convinced that a responsible investment strategy is inseparable from significant value creation. In other words, for us, a company's performance cannot be considered independently of its footprint on the world.", "Operational excellence and responsible business practices go hand in hand. Efficient cargo handling, thoughtful resource use, compliance and effective coordination create logistics operations that are safer and more resilient.<br><br>Responsibility is embedded in how we work, make decisions and improve. This approach helps us deliver lasting value to customers and partners across the global supply chain."],
    ["Sustainable performance", "Continuous improvement"],
    ["We believe that true value can only be created through sustainable performance. For us, this means investing responsibly, managing our assets with care, and honoring our commitments to our partners and shareholders.<br />\r\n<br />\r\nBy placing ESG criteria at the core of our approach, we aim to ensure the long-term financial performance of our investments and contribute to a better world for all. This is our promise at Sanfreight.", "Better logistics comes from continuously improving how we operate. Quality audits, employee training, efficient handling and close attention to compliance help us build stronger, more effective processes.<br><br>We build lasting relationships through reliability, transparent communication and responsible business practices. These principles guide every service we deliver to customers, suppliers and overseas partners."],
    ["Key points of our approach", "The foundations of our ESG approach"],
    ["For its future real estate development and restructuring operations, Sanfreight encourages environmentally friendly real estate projects that meet the latest energy standards and whose natural and renewable resources are used in construction processes in order to reduce the energy consumption of buildings.", "We work to improve routing, cargo consolidation and resource use across our operations. By reducing avoidable movement and supporting efficient transport decisions, we aim to limit environmental impact while maintaining dependable service."],
    ["Sanfreight places people at the heart of its investment projects. In the field, we ensure that we collaborate with service providers who respect a charter for environmental management while considering the health and safety of their employees, including on construction sites. Internally, we consider that our employees are our greatest asset: we pay particular attention to their well-being and their working conditions.", "Our people and partners are central to every shipment. We promote safe working practices, continuous learning, respectful collaboration and clear communication across our offices, warehouses and international logistics network."],
    ["The alternative investment funds created by Sanfreight are subject to the regulatory obligations of the AIFM for the approval of investments, the fight against money laundering and conflicts of interest. Sanfreight is committed to communicating transparently with its investors and partners.", "Strong governance supports reliable logistics. We operate with attention to compliance, accountability, ethical conduct and transparent communication, helping customers and partners navigate complex international supply chains with confidence."],
    ["Our 4-pillar approach", "Our responsible logistics framework"],
    ["Project sourcing", "Efficient operations"],
    ["Responsible investment", "People and safety"],
    ["Committed asset management", "Compliance and governance"],
    ["Eco-responsible commitment", "Responsible partnerships"],
    ["Sanfreight systematically carries out in-depth due diligence on its investment projects, ensuring that essential ESG criteria are identified in the context of new real estate developments or real estate revitalization involving major works.", "We strengthen planning, cargo consolidation and operational coordination to reduce unnecessary handling, delays and resource use while maintaining consistent service quality."],
    ["As part of its approach to value creation through responsible investment, Sanfreight ensures that ESG criteria are integrated into its management of the real estate operation, including the use of external service providers, while remaining committed to the tenants and respecting their conduct.", "We support safe workplaces, employee development and respectful collaboration. Training and clear procedures help our teams manage cargo responsibly across every operating environment."],
    ["Regarding the operational management of its assets, Sanfreight pays particular attention to the proper execution of its construction sites, whether in terms of human management of workers to protect their health and safety or in terms of waste management.", "We maintain disciplined processes for regulatory compliance, documentation and ethical conduct. Regular reviews and transparent communication reinforce accountability throughout our network."],
    ["Within Sanfreight, all employees are committed to implementing environmentally friendly practices on a daily basis in order to reduce their carbon footprint (paperless office, waste recycling, reduced water and energy consumption, etc.).", "We work closely with customers, carriers, agents and suppliers who share our commitment to reliability, responsible practices and continuous improvement across the logistics chain."],
    ["Our ESG documents", "Our standards and commitments"],
    ["ESG Charter", "Quality and ESG commitments"],
    ["Certificates of contribution", "Compliance credentials"],
  ];
  for (const [current, replacement] of esgCopy) result = result.replaceAll(current, replacement);
  const esgPrinciples = [
    [/(<p class="description"[^>]*>)For its future real estate development[\s\S]*?energy consumption of buildings\.(<\/p>)/, "We improve routing, cargo consolidation and resource use across our operations. By reducing avoidable movement and supporting efficient transport decisions, we aim to limit environmental impact while maintaining dependable service."],
    [/(<p class="description"[^>]*>)Sanfreight places people at the heart[\s\S]*?working conditions\.(<\/p>)/, "Our people and partners are central to every shipment. We promote safe working practices, continuous learning, respectful collaboration and clear communication across our offices, warehouses and international logistics network."],
    [/(<p class="description"[^>]*>)The alternative investment funds created[\s\S]*?investors and partners\.(<\/p>)/, "Strong governance supports reliable logistics. We operate with attention to compliance, accountability, ethical conduct and transparent communication, helping customers and partners navigate complex international supply chains with confidence."],
  ] as const;
  for (const [pattern, copy] of esgPrinciples) result = result.replace(pattern, `$1${copy}$2`);
  result = result.replace(
    /Another step forward for Sanfreight with the creation of its ESG charter\./g,
    "Turning responsible commitments into everyday action."
  );
  result = result.replace(
    /We have taken a further step in our commitment as a responsible investor[\s\S]*?requires a tailored approach\./g,
    "Our ESG approach guides practical decisions across our operations, from resource efficiency and employee development to compliance and partner selection. We apply these principles with discipline while adapting them to the realities of each shipment, market and customer requirement."
  );
  result = result.replace(
    /The main entity of the Sanfreight Group, which specializes in real estate investment consulting, asset and project management\./g,
    "SanFreight provides integrated freight forwarding and supply-chain solutions across global markets."
  );
  result = result.replace(
    /(<p class="disclaimer-(?:am|platform|capital)">)[\s\S]*?(<\/p>)/g,
    "$1SanFreight Logistics provides integrated freight forwarding, customs, warehousing and specialized cargo services through a trusted international network.$2"
  );
  result = result.replace(
    /\s*<div class="module module-link-list"[^>]*>[\s\S]*?(?=<\/section>)/,
    "\n"
  );
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
