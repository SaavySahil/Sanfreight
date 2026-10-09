export type LogisticsServiceKey =
  | "ocean"
  | "air"
  | "customs"
  | "warehousing"
  | "specialized";

type SupportingService = { title: string; description: string };
type ShowcaseItem = { title: string; description: string };

export type LogisticsServiceContent = {
  heroTitle: string;
  heroLead: string;
  detailHeading: string;
  detailLead: string;
  capabilities: [{ heading: string; detail: string }, { heading: string; detail: string }, { heading: string; detail: string }];
  optionsHeading: string;
  optionsLead: string;
  options: [{ heading: string; detail: string }, { heading: string; detail: string }, { heading: string; detail: string }];
  supportingHeading: string;
  supportingServices: [SupportingService, SupportingService, SupportingService];
  showcaseHeading: string;
  showcaseLead: string;
  showcase: [ShowcaseItem, ShowcaseItem, ShowcaseItem, ShowcaseItem, ShowcaseItem, ShowcaseItem, ShowcaseItem];
  contactCopy: string;
};

export const logisticsServiceContent: Record<LogisticsServiceKey, LogisticsServiceContent> = {
  ocean: {
    heroTitle: "Ocean Freight: connecting your<br class=\"sf-hero-title-break\" /> business to <span>global markets</span>",
    heroLead: "Flexible FCL and LCL shipping solutions across major ports worldwide.",
    detailHeading: "Ocean freight solutions tailored to your <span>specific cargo requirements</span>",
    detailLead: "SanFreight combines experienced teams and established shipping partnerships to handle diverse cargo, from everyday goods to specialised shipments.",
    capabilities: [
      { heading: "Established shipping partnerships:", detail: "Strong relationships with shipping lines, agents and co-loaders." },
      { heading: "Diverse industry coverage:", detail: "Shipping FMCG, electronics, machinery, chemicals, pharmaceuticals and food products for businesses." },
      { heading: "Specialist cargo expertise:", detail: "Experienced teams handling perishables and breakbulk." },
    ],
    optionsHeading: "The right container space for every shipment size",
    optionsLead: "Choose full container loads or shared container space, based on your cargo volume and budget.",
    options: [
      { heading: "Dedicated container space for your larger cargo shipments", detail: "For larger shipments, Full Container Load gives your cargo dedicated container space. We tailor shipping arrangements to your requirements, whether you are moving machinery, consumer goods, chemicals or pharmaceutical products across international markets." },
      { heading: "Shared container space for smaller shipments", detail: "For smaller shipments, Less than Container Load lets your cargo share container space. Through established co-loader relationships, we arrange ocean freight around your shipment volume, helping you avoid booking an entire container for yourself." },
      { heading: "Specialised handling for complex cargo", detail: "Some shipments need more than standard container handling. Our specialists assess heavy, oversized or temperature-sensitive cargo and plan suitable transport arrangements. From breakbulk machinery to perishable goods, we bring focused expertise to the complexities of moving specialised cargo by sea." },
    ],
    supportingHeading: "Connect your sea shipment with <span>supporting services</span>",
    supportingServices: [
      { title: "Customs Clearance Support", description: "Your sea shipment also needs customs support. SanFreight provides customs clearance services through its licensed CHA expertise, representing clients during inspections, assessments and duty payments. Add customs clearance to your ocean freight requirements to coordinate these formalities alongside your cargo movement." },
      { title: "Connected Inland Transportation", description: "The sea journey is one part of your cargo movement. SanFreight provides inland transportation with doorstep pickup and delivery across the country. Whether transporting general, temperature-controlled, hazardous or oversized cargo, connect your ocean freight with transport for the next inland leg." },
      { title: "Warehousing Around Your Shipment", description: "When your shipment needs storage, SanFreight offers warehousing as a supporting service. Discuss your storage requirements alongside your ocean freight enquiry, so warehousing can be considered within your wider cargo movement plan." },
    ],
    showcaseHeading: "Ocean freight support, planned around <span>your cargo</span>",
    showcaseLead: "Coordinate container space, shipping routes and supporting logistics around the details of each sea shipment.",
    showcase: [
      { title: "FCL and LCL options", description: "Choose full container or shared container shipping based on cargo volume, route and shipment requirements." },
      { title: "International route planning", description: "Coordinate ocean freight routes and sailing plans with the shipment origin, destination and timing." },
      { title: "Carrier and co-loader coordination", description: "Work with shipping line, agent and co-loader partners to arrange cargo movement across trade lanes." },
      { title: "Cargo-specific handling", description: "Discuss handling needs for general, temperature-sensitive, hazardous, oversized or breakbulk cargo." },
      { title: "Shipment milestone updates", description: "Keep key parties informed as cargo moves through collection, departure, transit and arrival milestones." },
      { title: "Customs clearance support", description: "Connect import and export formalities with ocean freight planning and cargo documentation." },
      { title: "Inland and warehouse connections", description: "Coordinate the next leg with inland transportation, storage and destination handover requirements." },
    ],
    contactCopy: "Share your cargo details, origin, destination and shipment size to discuss your ocean freight requirements.",
  },
  air: {
    heroTitle: "Air Freight: move urgent cargo<br class=\"sf-hero-title-break\" /> with <span>global reach</span>",
    heroLead: "Time-sensitive air cargo coordinated around your shipment priorities and delivery window.",
    detailHeading: "Air freight services planned around your <span>cargo and timeline</span>",
    detailLead: "SanFreight coordinates international air cargo with responsive planning, careful handling and shipment updates from origin through arrival.",
    capabilities: [
      { heading: "Time-critical shipment planning:", detail: "Air freight options coordinated around your cargo, destination and required timeline." },
      { heading: "Handling matched to your cargo:", detail: "Shipment requirements and handling needs reviewed before dispatch." },
      { heading: "Clear movement updates:", detail: "Key shipment information coordinated across origin, transit and destination partners." },
    ],
    optionsHeading: "Air freight options for time-sensitive cargo",
    optionsLead: "Plan air cargo around delivery priorities, route availability and the specific requirements of your goods.",
    options: [
      { heading: "Express air freight for urgent shipments", detail: "For urgent cargo, SanFreight coordinates air freight options around your required delivery window, route and shipment details. Our team works with the relevant airline and destination partners to plan handling and handover." },
      { heading: "Air cargo for planned business shipments", detail: "When speed and shipment planning both matter, air cargo can connect your goods to international markets. We coordinate routing, capacity enquiries and shipment documentation around your cargo volume and destination." },
      { heading: "Special handling for sensitive goods", detail: "Cargo with specific handling needs requires clear preparation. Share the shipment details and handling requirements with our team so the appropriate arrangements can be discussed with the air freight partners involved." },
    ],
    supportingHeading: "Connect air freight with <span>the rest of your supply chain</span>",
    supportingServices: [
      { title: "Customs Clearance Support", description: "Keep import and export formalities connected to your air shipment. SanFreight coordinates customs clearance support and shipment documentation with the relevant parties, helping address border requirements as cargo moves through its route." },
      { title: "Warehousing & Distribution", description: "If goods need to be stored, sorted or prepared for onward movement, discuss warehousing requirements alongside your air freight plan. SanFreight can coordinate storage and distribution as part of a wider cargo movement." },
      { title: "Specialized Cargo Handling", description: "Oversized or non-standard cargo can need additional handling and planning. SanFreight coordinates specialized logistics around cargo dimensions, equipment and destination requirements." },
    ],
    showcaseHeading: "Air freight planning focused on <span>the shipment journey</span>",
    showcaseLead: "Connect time-sensitive cargo with coordinated routing, handling and destination planning.",
    showcase: [
      { title: "Urgent cargo planning", description: "Coordinate air freight options around shipment urgency, cargo details and the required delivery window." },
      { title: "Route and capacity coordination", description: "Review route availability and space requirements with the airline and logistics partners involved." },
      { title: "Cargo handling requirements", description: "Share dimensions, weight and handling instructions early so suitable arrangements can be discussed." },
      { title: "Air shipment documentation", description: "Coordinate shipment information and air waybill details with the parties handling the cargo." },
      { title: "Transit milestone updates", description: "Follow key movement updates across origin, transit points and arrival coordination." },
      { title: "Customs and destination planning", description: "Align clearance requirements and destination handover with the air cargo movement." },
      { title: "Onward delivery connections", description: "Plan how goods will continue from the airport to a warehouse, business location or final destination." },
    ],
    contactCopy: "Share your cargo details, origin, destination and delivery timeline to discuss air freight options.",
  },
  customs: {
    heroTitle: "Customs Clearance: simplify cross-border cargo<br class=\"sf-hero-title-break\" /> with <span>careful coordination</span>",
    heroLead: "Import and export clearance support for compliant international cargo movement.",
    detailHeading: "Customs clearance coordinated for <span>international trade</span>",
    detailLead: "SanFreight helps coordinate customs formalities, shipment information and cargo handovers with the relevant parties at each border.",
    capabilities: [
      { heading: "Import and export coordination:", detail: "Clearance support arranged for shipments moving across international borders." },
      { heading: "Shipment document support:", detail: "Cargo and paperwork details coordinated to help prepare customs submissions." },
      { heading: "Clear border communication:", detail: "Updates shared as clearance requirements and cargo release steps progress." },
    ],
    optionsHeading: "Prepare each shipment for customs clearance",
    optionsLead: "Clear shipment details and timely coordination help address import and export formalities throughout the freight journey.",
    options: [
      { heading: "Import customs clearance coordination", detail: "For inbound cargo, SanFreight coordinates import clearance requirements with customers and the relevant customs partners. Shipment details and supporting documents are reviewed to help prepare declarations and cargo release steps." },
      { heading: "Export customs clearance coordination", detail: "For outbound shipments, our team coordinates export documentation and clearance steps with the parties involved. Early planning helps align customs formalities with cargo collection, transport and departure schedules." },
      { heading: "Documentation and compliance support", detail: "Customs processes depend on accurate shipment information. SanFreight coordinates document checks, goods details and applicable classification information with customers and licensed customs house agents as part of the clearance process." },
    ],
    supportingHeading: "Keep customs clearance connected to <span>your freight movement</span>",
    supportingServices: [
      { title: "Ocean Freight Coordination", description: "Connect customs clearance with FCL and LCL ocean freight planning. SanFreight coordinates shipment information and border formalities alongside the sea movement from origin through destination." },
      { title: "Air Freight Coordination", description: "For urgent and time-sensitive cargo, customs planning is part of the air freight journey. Coordinate documentation and clearance requirements with the air shipment and destination handover." },
      { title: "Inland Transport & Delivery", description: "After customs release, cargo may need to continue to a warehouse, facility or final destination. SanFreight can coordinate inland transport requirements as part of the wider shipment plan." },
    ],
    showcaseHeading: "Customs clearance coordinated at <span>every shipment stage</span>",
    showcaseLead: "Keep shipment information, border formalities and cargo handovers connected across import and export movements.",
    showcase: [
      { title: "Import clearance coordination", description: "Coordinate inbound cargo details and import requirements with the relevant customs partners." },
      { title: "Export clearance coordination", description: "Prepare export shipment information and formalities alongside cargo collection and departure plans." },
      { title: "Document readiness", description: "Review commercial and transport documents with customers to help prepare the customs submission." },
      { title: "Goods and classification details", description: "Coordinate product descriptions and applicable classification information for the shipment." },
      { title: "Duty and assessment support", description: "Share shipment information needed to review applicable duties and customs assessments with the responsible parties." },
      { title: "Inspection and border updates", description: "Coordinate communication around inspections, additional requests and other border steps." },
      { title: "Cargo release handover", description: "Connect clearance progress with transport dispatch and the next cargo handover." },
    ],
    contactCopy: "Share your shipment details, origin, destination and cargo documents to discuss customs clearance support.",
  },
  warehousing: {
    heroTitle: "Warehousing & Logistics: keep goods moving<br class=\"sf-hero-title-break\" /> with <span>connected operations</span>",
    heroLead: "Storage, inland transport and distribution coordinated around your supply chain.",
    detailHeading: "Warehousing and logistics for <span>connected supply chains</span>",
    detailLead: "SanFreight coordinates goods receiving, storage and onward movement to help businesses manage inventory across the supply chain.",
    capabilities: [
      { heading: "Organized goods receiving:", detail: "Inbound cargo and facility handovers coordinated around operational needs." },
      { heading: "Storage and inventory handling:", detail: "Warehousing processes planned to keep stock and movement information organized." },
      { heading: "Onward transport coordination:", detail: "Inland dispatch and distribution connected to the next shipment milestone." },
    ],
    optionsHeading: "Warehousing that supports the next move",
    optionsLead: "Bring receiving, storage and onward cargo movement into a coordinated logistics plan.",
    options: [
      { heading: "Goods receiving and secure storage", detail: "Plan inbound handovers and storage around your goods, facility requirements and operational schedule. SanFreight coordinates receiving and warehousing needs so cargo can be organized before its next movement." },
      { heading: "Inventory handling and order preparation", detail: "Clear inventory processes help teams understand what has arrived and what is ready to move. Discuss stock handling, order preparation and fulfilment requirements with SanFreight when planning your warehousing support." },
      { heading: "Inland transport and distribution", detail: "When goods are ready to leave storage, coordinate dispatch and delivery requirements with the warehouse plan. SanFreight can connect inland transportation and distribution handovers with the next destination." },
    ],
    supportingHeading: "Connect warehousing with <span>freight and delivery</span>",
    supportingServices: [
      { title: "Ocean Freight Coordination", description: "Coordinate FCL or LCL ocean freight with the receiving and storage plan for your goods. SanFreight can align cargo arrival information with warehousing and onward transport requirements." },
      { title: "Air Freight Coordination", description: "Time-sensitive goods may need quick movement after arrival. Discuss air freight, storage and onward delivery together so the shipment plan reflects your timeline and handling needs." },
      { title: "Customs Clearance Support", description: "Customs clearance and warehouse handover often need to be planned together. Coordinate import or export formalities with the storage and onward movement requirements for your cargo." },
    ],
    showcaseHeading: "Warehouse operations aligned with <span>your next delivery</span>",
    showcaseLead: "Connect receiving, storage, inventory handling and onward movement in one practical logistics plan.",
    showcase: [
      { title: "Inbound goods receiving", description: "Plan arrival information and warehouse handover around facility and operating requirements." },
      { title: "Secure storage planning", description: "Discuss storage needs, cargo characteristics and expected dwell time with the warehousing team." },
      { title: "Inventory handling", description: "Keep stock records and movement information organized as goods are received and prepared." },
      { title: "Order preparation", description: "Coordinate order picking and preparation requirements before goods leave the facility." },
      { title: "Fulfilment coordination", description: "Connect fulfilment workflows with customer orders and planned dispatch requirements." },
      { title: "Inland transport dispatch", description: "Arrange onward transportation in line with cargo readiness and delivery destinations." },
      { title: "Distribution handover", description: "Coordinate delivery handovers and status updates as goods move to their next location." },
    ],
    contactCopy: "Share your goods, storage, inventory and delivery requirements to discuss warehousing and logistics support.",
  },
  specialized: {
    heroTitle: "Specialized Logistics: plan complex cargo<br class=\"sf-hero-title-break\" /> with <span>precision and care</span>",
    heroLead: "Planning-led logistics for oversized, heavy-lift and non-standard project cargo.",
    detailHeading: "Specialized logistics for <span>complex cargo requirements</span>",
    detailLead: "SanFreight coordinates project cargo movements around shipment dimensions, route conditions, equipment and site requirements.",
    capabilities: [
      { heading: "Cargo and route assessment:", detail: "Cargo dimensions, access constraints and movement requirements reviewed early." },
      { heading: "Equipment and partner coordination:", detail: "Specialist equipment and experienced project partners aligned to the movement plan." },
      { heading: "Planned site handovers:", detail: "Loading, delivery access and on-site coordination considered through project planning." },
    ],
    optionsHeading: "Project cargo planned around real-world constraints",
    optionsLead: "Non-standard shipments call for early coordination between cargo, route, equipment and destination requirements.",
    options: [
      { heading: "Cargo assessment and movement planning", detail: "Start with the cargo dimensions, weight, handling needs and required destination. SanFreight reviews the shipment profile with customers and partners to identify the planning considerations for an oversized or heavy-lift movement." },
      { heading: "Route, site and equipment coordination", detail: "Project cargo plans account for route restrictions, access points, lifting requirements and site readiness. SanFreight coordinates suitable equipment and project partners around the operational needs of the shipment." },
      { heading: "Project cargo oversight through delivery", detail: "Keep the movement coordinated from preparation through final handover. SanFreight works with the parties involved to align transport milestones, on-site handling and delivery requirements." },
    ],
    supportingHeading: "Connect project cargo with <span>the right logistics services</span>",
    supportingServices: [
      { title: "Ocean Freight for Project Cargo", description: "For cargo moving by sea, discuss dimensions, handling requirements and destination constraints as part of the freight plan. SanFreight coordinates ocean freight requirements with the project cargo movement." },
      { title: "Customs Clearance Support", description: "Project shipments may require detailed cargo information for cross-border formalities. Coordinate customs documentation and clearance requirements with the cargo and route plan." },
      { title: "Inland Transport & Site Delivery", description: "The final leg can involve access, lifting and delivery constraints. SanFreight can coordinate inland transport and site handovers with the wider project logistics plan." },
    ],
    showcaseHeading: "Project logistics built around <span>cargo and site requirements</span>",
    showcaseLead: "Plan non-standard movements with early attention to route conditions, handling equipment and delivery access.",
    showcase: [
      { title: "Cargo dimensions and weight", description: "Review shipment dimensions, weight, centre of gravity and handling needs before movement planning." },
      { title: "Route and access planning", description: "Check route limits, access constraints and site conditions that may affect the cargo movement." },
      { title: "Specialist equipment selection", description: "Coordinate suitable lifting and transport equipment with the shipment and site requirements." },
      { title: "Project partner coordination", description: "Align carriers, handling teams and other project partners around the agreed movement plan." },
      { title: "Loading and lift preparation", description: "Coordinate loading sequence, lifting arrangements and cargo handovers with responsible teams." },
      { title: "Site delivery coordination", description: "Plan destination access, unloading and on-site handover before the shipment arrives." },
      { title: "Project milestone updates", description: "Keep key parties aligned as preparation, transport and delivery milestones progress." },
    ],
    contactCopy: "Share your cargo dimensions, weight, route and site requirements to discuss specialized logistics planning.",
  },
};
