import { redirect } from "next/navigation";

// Keep old bookmarks on the latest upstream dashboard rather than the draft UI.
export default function LegacyDashboardPage() {
  redirect("/dashboard/home");
}
