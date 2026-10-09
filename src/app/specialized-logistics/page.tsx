import type { Metadata } from "next";
import LogisticsServicePage from "@/components/LogisticsServicePage";
import { logisticsServiceContent } from "@/lib/logisticsServiceContent";

export const metadata: Metadata = {
  title: "Specialized Logistics & Project Cargo | SanFreight Logistics",
  description: "Specialized logistics for oversized, heavy-lift and non-standard project cargo, with cargo assessment, route planning, equipment coordination and delivery oversight.",
  keywords: ["specialized logistics", "project cargo", "heavy-lift cargo", "oversized cargo transport", "project logistics", "SanFreight Logistics"],
  alternates: { canonical: "https://sanfreightnew.vercel.app/specialized-logistics" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Specialized Logistics & Project Cargo | SanFreight Logistics",
    description: "Specialized logistics for oversized, heavy-lift and non-standard project cargo, with cargo assessment, route planning, equipment coordination and delivery oversight.",
    url: "https://sanfreightnew.vercel.app/specialized-logistics",
    siteName: "SanFreight Logistics",
  },
};
export const dynamic = "force-dynamic";

export default function SpecializedLogisticsPage() {
  return <LogisticsServicePage service={logisticsServiceContent.specialized} />;
}
