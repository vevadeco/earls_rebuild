import LandingPage from "@/screens/LandingPage";
import { getSnowContractSeason } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const snowContractSeason = await getSnowContractSeason();
  return <LandingPage snowContractSeason={snowContractSeason} />;
}
