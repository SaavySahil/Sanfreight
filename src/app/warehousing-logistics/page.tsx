import type { Metadata } from "next";
import LogisticsServicePage from "@/components/LogisticsServicePage";
import { logisticsServiceContent } from "@/lib/logisticsServiceContent";

export const metadata: Metadata = {
  title: "Warehousing & Logistics Services | SanFreight Logistics",
  description: "Warehousing and logistics support for receiving, storage, inventory handling, inland transport, order fulfilment and distribution.",
  keywords: ["warehousing", "warehouse logistics", "inventory handling", "inland transportation", "order fulfilment", "SanFreight Logistics"],
  alternates: { canonical: "https://sanfreightnew.vercel.app/warehousing-logistics" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Warehousing & Logistics Services | SanFreight Logistics",
    description: "Warehousing and logistics support for receiving, storage, inventory handling, inland transport, order fulfilment and distribution.",
    url: "https://sanfreightnew.vercel.app/warehousing-logistics",
    siteName: "SanFreight Logistics",
  },
};
export const dynamic = "force-dynamic";

export default function WarehousingLogisticsPage() {
  return <LogisticsServicePage service={logisticsServiceContent.warehousing} />;
}
