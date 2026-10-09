import type { Metadata } from "next";
import LogisticsServicePage from "@/components/LogisticsServicePage";
import { logisticsServiceContent } from "@/lib/logisticsServiceContent";

export const metadata: Metadata = {
  title: "Air Freight Services | SanFreight Logistics",
  description: "International air freight for urgent and time-sensitive shipments, with cargo handling, capacity coordination, customs support and delivery planning.",
  keywords: ["air freight", "international air cargo", "time-sensitive shipping", "air cargo services", "SanFreight Logistics"],
  alternates: { canonical: "https://sanfreightnew.vercel.app/air-freight" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Air Freight Services | SanFreight Logistics",
    description: "International air freight for urgent and time-sensitive shipments, with cargo handling, capacity coordination, customs support and delivery planning.",
    url: "https://sanfreightnew.vercel.app/air-freight",
    siteName: "SanFreight Logistics",
  },
};
export const dynamic = "force-dynamic";

export default function AirFreightPage() {
  return <LogisticsServicePage service={logisticsServiceContent.air} />;
}
