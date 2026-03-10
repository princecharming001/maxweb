import { redirect } from "next/navigation";

export const metadata = {
  title: "Max",
};

export default function PaymentPage() {
  redirect("/signup");
}
