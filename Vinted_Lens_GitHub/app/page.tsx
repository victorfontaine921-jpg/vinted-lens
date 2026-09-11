import { getChatGPTUser } from "./chatgpt-auth";
import VintedLensApp from "./vinted-lens-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  return <VintedLensApp displayName={firstName} />;
}
