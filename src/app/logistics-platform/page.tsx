import type { Metadata } from "next";
import LogisticsServicePage from "@/components/LogisticsServicePage";
import { logisticsServiceContent } from "@/lib/logisticsServiceContent";

export const metadata: Metadata = {
  title: "Ocean Freight Services | SanFreight Logistics",
  description: "Flexible FCL and LCL ocean freight solutions across major ports worldwide, supported by customs clearance, inland transportation and warehousing.",
  keywords: ["ocean freight", "FCL shipping", "LCL shipping", "international sea freight", "SanFreight Logistics"],
  alternates: { canonical: "https://sanfreightnew.vercel.app/logistics-platform" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Ocean Freight Services | SanFreight Logistics",
    description: "Flexible FCL and LCL ocean freight solutions across major ports worldwide, supported by customs clearance, inland transportation and warehousing.",
    url: "https://sanfreightnew.vercel.app/logistics-platform",
    siteName: "SanFreight Logistics",
  },
};
export const dynamic = "force-dynamic";

export default function OceanFreightPage() {
  return <LogisticsServicePage service={logisticsServiceContent.ocean} />;
}
