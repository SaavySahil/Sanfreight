const solutions = [
  ["Ocean Freight", "Reliable FCL and LCL shipping across global trade routes.", "nav-service-1.webp", "/logistics-platform"],
  ["Air Freight", "Time-critical air cargo with dependable global reach.", "nav-service-7.webp", "/air-freight"],
  ["Customs Clearance", "Compliant import and export clearance without avoidable delays.", "nav-service-6.webp", "/customs-clearance"],
  ["Warehousing & Logistics", "Secure storage, inland transport and responsive distribution.", "nav-service-3.webp", "/warehousing-logistics"],
  ["Specialized Logistics", "Expert handling for oversized and complex project cargo.", "nav-service-4.webp", "/specialized-logistics"],
] as const;

const esgImageFallbacks: Record<string, string> = {
  "/wp-content/uploads/2023/09/logo1.png": "/images/certificates/1.png",
  "/wp-content/uploads/2023/09/logo2.png": "/images/certificates/2.png",
  "/wp-content/uploads/2023/09/logo3.png": "/images/certificates/3.png",
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

const certificateLogos = [
  ["/images/certificates/1.png", "inset(6% 4.25% 10.25% 4.63%)"],
  ["/images/certificates/2.png", "inset(9.5% 29.88% 9.75% 29.88%)"],
  ["/images/certificates/3.png", "inset(11% 16% 9.75% 16.25%)"],
  ["/images/certificates/4.png", "inset(11% 26.63% 10.5% 27.38%)"],
  ["/images/certificates/5.png", "inset(11.25% 12.13% 9% 13.25%)"],
  ["/images/certificates/6.png", "inset(10.5% 12.75% 9.25% 12.75%)"],
  ["/images/certificates/7.png", "inset(21.25% 5.25% 18.75% 5.25%)"],
  ["/images/certificates/8.png", "inset(10.75% 30.75% 11% 30.38%)"],
  ["/images/certificates/9.png", "inset(11% 26.75% 11% 26.75%)"],
] as const;

export function withFinalSanfreightLogo(html: string): string {
  return html
    .replaceAll('/images/sanfreight-logo-dark-cropped.webp', '/images/sanfreight-logo-final-dark.png')
    .replaceAll('/images/sanfreight-logo-dark.webp', '/images/sanfreight-logo-final-dark.png')
    .replaceAll('/images/sanfreight-logo-white-cropped.webp', '/images/sanfreight-logo-final-light.png')
    .replaceAll('/images/sanfreight-logo-white-new.webp', '/images/sanfreight-logo-final-light.png');
}

export function withSolutionsNav(html: string): string {
  const opening = '<div class="slideshow-wrapper embla__container">';
  const ending = '</div></div><div class="progress-w">';
  const slides = solutions.map(([title, description, image, href]) =>
    `<a class="slide embla__slide sf-solution-card-link" href="${href}" aria-label="Explore ${title} services" style="display:block;cursor:pointer;"><div class="image-wrapper"><img src="/images/${image}" class="picture image" loading="lazy" alt="" draggable="false"/></div><div class="content"><div class="top"><h3 class="title ts-xl">${title}</h3><p class="investment-description ts-xs">${description}</p></div><div class="bottom-content"><div><i class="icon icon-arrow-right"></i></div><p>SanFreight Logistics</p></div></div></a>`
  ).join("");

  // ESG is now a live route: restore its navigation links across desktop,
  // mobile and footer markup imported from the legacy page snapshots.
  let result = withFinalSanfreightLogo(html)
    .replaceAll('data-disabled-href="/en/esg/"', 'href="/en/esg/"');
  result = result.replace(
    /<a\b([^>]*)>(\s*<span>Expertises<\/span>\s*)<\/a>/g,
    (_match, attributes: string, label: string) => {
      const cleanAttributes = attributes
        .replace(/\sdata-page=""/g, "")
        .replace(/\sdata-disabled-href="[^"]*"/g, "")
        .replace(/\s+href="[^"]*"/g, "");
      return `<a${cleanAttributes} href="/en/expertises-en/">${label}</a>`;
    }
  );
  for (const [missing, fallback] of Object.entries(esgImageFallbacks)) {
    result = result.replaceAll(missing, fallback);
  }
  if (result.includes('/images/certificates/1.png')) {
    const logos = certificateLogos
      .map(([src, crop]) => `<img src="${src}" alt="" aria-hidden="true" loading="lazy" decoding="async" style="object-view-box:${crop};"/>`)
      .join("");
    result = result.replace(
      /<div class="listImage"([^>]*)>[\s\S]*?<\/div>/,
      (_match, attributes: string) => `<div class="listImage sf-certificate-logo-list"${attributes} role="group" aria-label="Certifications and logistics memberships">${logos}</div>`,
    );
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

  // Keep the scraped Expertises page's original module structure and interactions;
  // replace only its legacy investment/property content and broken reference targets.
  const expertisesStart = result.indexOf('<section id="expertises"');
  const isExpertisesPage = expertisesStart >= 0;
  if (expertisesStart >= 0) {
    const sectionTags = /<\/?section\b[^>]*>/gi;
    sectionTags.lastIndex = result.indexOf(">", expertisesStart) + 1;
    let depth = 1;
    let expertisesEnd = -1;
    let tag: RegExpExecArray | null;
    while ((tag = sectionTags.exec(result))) {
      depth += tag[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        expertisesEnd = sectionTags.lastIndex;
        break;
      }
    }
    if (expertisesEnd > expertisesStart) {
      let page = result.slice(expertisesStart, expertisesEnd);
      page = page
        .replaceAll('/wp-content/uploads/fly-images/8638/expertise-1920x1080-c.png', '/images/expertises-intro.webp')
        .replaceAll('/wp-content/uploads/fly-images/8638/expertise-562x1218-c.png', '/images/expertises-intro.webp');
      page = page.replace(
        /data-urls="[^"]*"/,
        'data-urls="%7B%22en%22%3A%22%2Fen%2Fexpertises-en%2F%22%7D"'
      );
      const copy: Array<[string, string]> = [
        ["We demonstrate rigorous selection of our operations through our sharp expertise.", "Integrated logistics solutions, coordinated with care from origin to destination."],
        ["Discover our expertise", "Explore our capabilities"],
        ["Our expertise", "Our logistics expertise"],
        ["Sanfreight brings together in-depth expertise in the field of logistics investment.", "SanFreight connects freight forwarding, customs, warehousing and specialized cargo expertise across a trusted international network."],
        ["Private Equity funds", "Ocean Freight"],
        ["Private Equity fund structures enable our investors to pool their capital with limited dilution of their interest in redistributed capital gains.", "Reliable ocean freight for containerized cargo across international routes, coordinated from origin through arrival."],
        ["This type of fund is ideally suited to professional investors who are accustomed to investing and optimizing their returns.", "Plan FCL and LCL shipments with clear milestones, carrier coordination and shipment visibility."],
        ["Club-Deals", "Air Freight"],
        ["Co-investments (i.e. joint ventures), which can be carried out via our dedicated funds or our Club Deals, enable us to collaborate with leading investors and partners.", "Responsive air cargo solutions for urgent shipments, coordinated around critical delivery timelines."],
        ["The founders of Sanfreight have a long history of bringing together investment partners with common interests to invest in portfolios or single assets.", "Priority handling, capacity planning and proactive updates help keep time-sensitive cargo moving."],
        ["Capital Investment / Private debt", "Customs Clearance"],
        ["Private debt investments are transactions carried out outside regulated financial markets.", "Navigate import and export requirements with practical documentation support and customs coordination."],
        ["We structure transactions involving banks and alternative lenders, combining different capital structures (e.g. mezzanine debt, senior debt, whole loan, preferred equity, etc.).", "Our team helps align declarations, classification and shipment paperwork so cargo can move across borders with fewer avoidable delays."],
        ["Our expertise by profile", "Connected logistics services"],
        ["Sanfreight Group strengthens its pan-European position as a logistics operator and manager of private equity investment solutions.", "From warehouse operations to complex project cargo, our teams coordinate the people, processes and partners behind dependable logistics."],
        ["Investors", "Warehousing & Logistics"],
        ["Logistics operators", "Specialized Logistics"],
        ["Latest references", "Logistics across every stage"],
        ["15 Fénelon", "Ocean Freight"],
        ["91 Champs&#8209Élysées", "Air Freight"],
        ["Mageva 360", "Customs Clearance"],
        ["ho Hospitality", "GLOBAL NETWORK"],
        ["mi Mixed Use", "TIME-CRITICAL CARGO"],
        ["ho Hospitality fr France", "CROSS-BORDER SUPPORT"],
        ["Transformation of an office building into a high&#8209end serviced residence located in the heart of Paris’s 10th arrondissement, in a lively and rapidly evolving neighborhood.", "Dependable ocean freight coordination for containerized cargo across major international routes, with shipment visibility from origin to destination."],
        ["Acquisition of a mixed&#8209use building at 91 Champs&#8209Élysées in Paris, located on the most central stretch of the avenue. This exceptional 4,200 m² property enjoys unmatched visibility on the world’s most iconic thoroughfare, in the heart of the Golden Triangle, just steps away from the leading international luxury brands.", "Time-sensitive air freight planned around critical delivery windows, with coordinated handling and clear updates throughout the journey."],
        ["Mageva 360 project is based on the acquisition of a historic chalet designed in 1961 by French architect Henry&#8209Jacques Le Même, formerly a holiday center. The project aims to transform this iconic building into a unique high&#8209end hotel complex.", "Customs clearance support helps align shipment documentation and border requirements for smooth, compliant international cargo movement."],
      ];
      for (const [from, to] of copy) page = page.replaceAll(from, to);
      page = page.replaceAll("Our logistics expertise by profile", "Connected logistics services");

      const textModuleStart = page.indexOf('module-text-and-caption split-text');
      const cardsModuleStart = page.indexOf('module-expertises-cards');
      if (textModuleStart >= 0 && cardsModuleStart > textModuleStart) {
        let intro = page.slice(textModuleStart, cardsModuleStart);
        intro = intro.replace(
          /(<div class="content" data-animation="reveal-words">)[\s\S]*?(<\/div>)/,
          "$1Our teams coordinate freight, customs, storage and specialized cargo to make complex supply chains more dependable.$2"
        );
        intro = intro.replace(
          /<p data-animation="reveal-lines">[\s\S]*?<\/p>/,
          "<p data-animation=\"reveal-lines\">Across ocean and air freight, customs clearance, warehousing and project logistics, we focus on clear communication, careful handling and reliable execution. Our teams work with customers and trusted partners to coordinate each shipment around its route, timing and cargo requirements.</p>"
        );
        page = page.slice(0, textModuleStart) + intro + page.slice(cardsModuleStart);
      }

      const profilesStart = page.indexOf('module-expertises-profiles');
      const referencesStart = page.indexOf('module-references', profilesStart);
      if (profilesStart >= 0 && referencesStart > profilesStart) {
        let profiles = page.slice(profilesStart, referencesStart);
        const profileServices = [
          { title: "Ocean Freight", href: "/logistics-platform", copy: "Coordinate FCL and LCL ocean freight across international routes with carrier planning, clear milestones and cargo visibility from origin to destination.", tabs: [["FCL & LCL shipping", "Full-container and shared-container options"], ["Carrier coordination", "Capacity and sailing schedules aligned to cargo needs"], ["Route planning", "International routing coordinated from origin"], ["Shipment visibility", "Milestone updates through arrival"]] },
          { title: "Air Freight", href: "/air-freight", copy: "Move urgent and time-sensitive cargo with responsive air freight planning, dependable handling and shipment updates aligned to delivery deadlines.", tabs: [["Priority cargo", "Express and time-critical air freight options"], ["Capacity planning", "Space coordinated around delivery deadlines"], ["Cargo handling", "Handling matched to shipment requirements"], ["Documentation", "Air waybill and shipment information coordinated"], ["Transit coordination", "Updates across origin, transit and arrival"], ["Delivery handover", "Arrival coordinated with destination partners"]] },
          { title: "Customs Clearance", href: "/customs-clearance", copy: "Support compliant import and export cargo movement with practical documentation, declaration and customs coordination across borders.", tabs: [["Import & export declarations", "Clearance coordinated for cross-border cargo"], ["Document review", "Shipment paperwork checked for completeness"], ["Classification support", "Goods information aligned with customs requirements"], ["Duty coordination", "Applicable duty details reviewed with the shipment"], ["Border coordination", "Requirements addressed before dispatch"], ["Cargo release updates", "Clear communication through clearance"]] },
          { title: "Warehousing & Logistics", href: "/warehousing-logistics", copy: "Keep goods organized and moving with secure warehousing, inventory processes and coordinated inland transport, fulfilment and distribution.", tabs: [["Secure storage", "Goods stored to suit operational requirements"], ["Inventory management", "Stock handling and records kept organized"], ["Goods receiving", "Inbound cargo coordinated at the facility"], ["Order fulfilment", "Orders prepared for onward movement"], ["Inland transport", "Dispatch coordinated between locations"], ["Final distribution", "Delivery handovers planned to destination"]] },
          { title: "Specialized Logistics", href: "/specialized-logistics", copy: "Plan oversized and non-standard cargo movements around route, equipment and site requirements, with experienced coordination from preparation through delivery.", tabs: [["Cargo assessment", "Shipment dimensions and handling needs reviewed"], ["Route & site planning", "Access and route constraints checked early"], ["Equipment selection", "Specialist equipment matched to the cargo"], ["Carrier coordination", "Experienced project partners aligned to the plan"], ["On-site handling", "Handover and lift activity coordinated safely"], ["Delivery oversight", "Progress monitored through final delivery"]] },
        ] as const;
        const addedSlides = profileServices.map((service, index) => {
          const slideClass = index === 0 ? "odd first" : index % 2 ? "even" : "odd";
          const tabs = service.tabs.map(([title, ...details], tabIndex) => `
            <div class="tabs">
              <div class="tabs-number-w text-container">${String(tabIndex + 1).padStart(2, "0")}</div>
              <div class="tabs-title-w text-container"><div class="tabs-title">${title}</div></div>
              <div class="tabs-desc-w text-container">${details.map((detail) => `<div class="tab-desc-w"><div class="item-desc-w">${detail}</div></div>`).join("")}</div>
              <div class="separator"></div>
            </div>`).join("");
          return `
            <div id="expertise-profile-slide-${index}"></div>
            <div class="slide ${slideClass}">
              <div class="inner"><div class="content"><div class="angle"></div>
                <div class="title-w">${service.title}</div><div class="separator"></div>
                <div class="dflex"><div class="left"></div><div class="right"><div class="wrapper">
                  <div class="description-w text-container"><div class="description"><p>${service.copy}</p></div></div>
                  <div class="separator hide-tablet hide-desktop mb"></div>${tabs}
                </div></div>
                <div class="cta-w" data-follow-link><a class="cta-small transparent" href="${service.href}"><div class="cta-small-content"><div class="cta-small-wrapper"><p class="text"><span>Learn more</span></p><div class="cta-small-arrows-wrapper"><div class="icon icon-arrow-right"></div><div class="icon icon-arrow-right absolute"></div></div></div></div></a></div>
                </div>
              </div>
              </div>
            </div>`;
        }).join("");
        const expertisesWrapper = profiles.indexOf('<div class="expertises-w">');
        const selectorWrapper = profiles.indexOf('<div class="expertises-profiles-selector-w"');
        if (expertisesWrapper >= 0 && selectorWrapper > expertisesWrapper) {
          const wrapperContentStart = profiles.indexOf(">", expertisesWrapper) + 1;
          const moduleContentClose = profiles.lastIndexOf("</div>", selectorWrapper);
          const expertisesClose = profiles.lastIndexOf("</div>", moduleContentClose - 1);
          profiles = profiles.slice(0, wrapperContentStart) + addedSlides + profiles.slice(expertisesClose, selectorWrapper) + profiles.slice(selectorWrapper);
          const updatedSelectorWrapper = profiles.indexOf('<div class="expertises-profiles-selector-w"');
          const selectorLine = profiles.indexOf('<div class="expertises-profiles-selector-line"></div>', updatedSelectorWrapper);
          const selectors = profileServices
            .map((service, index) => `<div class="expertises-profiles-selector" data-index="${index}">${service.title}</div>`)
            .join("");
          const selectorContentStart = profiles.indexOf(">", updatedSelectorWrapper) + 1;
          profiles = profiles.slice(0, selectorContentStart) + selectors + profiles.slice(selectorLine);
        }
        page = page.slice(0, profilesStart) + profiles + page.slice(referencesStart);
      }

      const refsStart = page.indexOf('module-references');
      if (refsStart >= 0) {
        const moduleStart = page.lastIndexOf('<div class="module-full module-references', refsStart);
        const moduleEnd = page.indexOf('</section>', moduleStart);
        if (moduleStart >= 0 && moduleEnd > moduleStart) {
          page = page.slice(0, moduleStart) + page.slice(moduleEnd);
        }
      }
      result = result.slice(0, expertisesStart) + page + result.slice(expertisesEnd);
    }
  }

  if (isExpertisesPage) {
    result = result
      .replaceAll(
        "The main entity of the Sanfreight Group, which specializes in logistics investment consulting, asset and project management.",
        "SanFreight Logistics provides integrated freight forwarding, customs, warehousing and specialized cargo services across international markets."
      )
      .replaceAll(
        "Our digital platform that enables our customers to subscribe and invest in our products",
        "Our logistics network connects customers and trusted partners throughout the shipment journey"
      )
      .replaceAll("Sanfreight Platform", "SanFreight Logistics");
  }

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

  // The source header places its controls beside the progress bar. Keep that
  // structure in both mobile and desktop menu panels so their shared carousel
  // CSS can align the full track and both arrows together.
  result = result.replace(
    /<div class="progress-w"><div class="progress-bars"><div class="progress-bar-active"><\/div><\/div><\/div><div class="controls"><div class="control prev"><i class="icon icon-arrow-left"><\/i><\/div><div class="control next"><i class="icon icon-arrow-right"><\/i><\/div><\/div>/g,
    '<div class="progress-w"><div class="progress-bars"><div class="progress-bar"></div><div class="progress-bar-active"></div></div><div class="control-w"><div class="control prev"><i class="icon icon-arrow-right"></i></div><div class="control next"><i class="icon icon-arrow-right"></i></div></div></div>'
  );

  return result;
}
