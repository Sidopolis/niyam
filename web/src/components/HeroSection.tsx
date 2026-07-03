import { useState } from "react";
import { COPY } from "@/constants/copy";
import { HeroDitheringCard } from "@/components/ui/hero-dithering-card";

export default function HeroSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COPY.hero.primaryCta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-shell pt-40 md:pt-48 lg:pt-56">
      <HeroDitheringCard
        headline={COPY.hero.headline}
        subheadline={COPY.hero.subheadline}
        installCopied={copied}
        onCopyInstall={handleCopy}
      />
    </section>
  );
}
