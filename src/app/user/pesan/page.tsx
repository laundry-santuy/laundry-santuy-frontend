import { Suspense } from "react";
import { PesanOrderPage } from "@/app/user/_components/pesan/order-page";
import { OrderLoadingState } from "@/app/user/_components/pesan/order-states";

export default function PesanPage() {
  return (
    <Suspense fallback={<OrderLoadingState />}>
      <PesanOrderPage />
    </Suspense>
  );
}
