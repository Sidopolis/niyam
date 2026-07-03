import SiteNavbar from "@/components/SiteNavbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import MCPSection from "@/components/MCPSection";
import CLISection from "@/components/CLISection";
import InstallSection from "@/components/InstallSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <SiteNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MCPSection />
        <CLISection />
        <InstallSection />
      </main>
      <Footer />
    </>
  );
}
