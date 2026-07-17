import { requireUser } from "@/lib/auth";
import { PaymentMethodsClient } from "@/components/PaymentMethodsClient";

export default async function PaymentMethodsPage() {
  const user = await requireUser();

  return <PaymentMethodsClient userId={user.id} />;
}
