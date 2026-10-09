import type { Metadata } from "next";
import LogisticsServicePage from "@/components/LogisticsServicePage";
import { logisticsServiceContent } from "@/lib/logisticsServiceContent";

export const metadata: Metadata = {
  title: "Customs Clearance Services | SanFreight Logistics",
  description: "Import and export customs clearance support for international freight, including shipment documentation, declaration coordination and border updates.",
  keywords: ["customs clearance", "import customs clearance", "export customs clearance", "customs documentation", "SanFreight Logistics"],
  alternates: { canonical: "https://sanfreightnew.vercel.app/customs-clearance" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Customs Clearance Services | SanFreight Logistics",
    description: "Import and export customs clearance support for international freight, including shipment documentation, declaration coordination and border updates.",
    url: "https://sanfreightnew.vercel.app/customs-clearance",
    siteName: "SanFreight Logistics",
  },
};
export const dynamic = "force-dynamic";

export default function CustomsClearancePage() {
  return <LogisticsServicePage service={logisticsServiceContent.customs} />;
}
