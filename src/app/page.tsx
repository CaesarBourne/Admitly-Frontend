import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (user && isAdmin(user)) redirect("/admin");
  if (user) redirect("/welcome");
  redirect("/login");
}
