import dynamic from "next/dynamic";

const PayPageClient = dynamic(() => import("./PayPageClient"), { ssr: false });

export default function PayPage() {
  return <PayPageClient />;
}
