import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { COPY } from "@/constants/copy";
import { LINKS } from "@/constants/links";
import { RibbonDitherBanner } from "@/components/ui/ribbon-dither-banner";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: LINKS.features },
  { label: "MCP", href: LINKS.mcp },
  { label: "CLI", href: LINKS.cli },
  { label: COPY.nav.docs, href: LINKS.docs },
];

export default function SiteNavbar() {
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 80) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false);
        setMobileOpen(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      {/* Ribbon */}
      <div className="flex justify-center bg-paper/60 backdrop-blur-sm py-2 px-4">
        <RibbonDitherBanner>
          <span className="px-3 py-1 text-xs font-medium text-ink">
            {COPY.nav.ribbon}
          </span>
          <a
            href={LINKS.install}
            className="px-3 py-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {COPY.nav.ribbonCta} →
          </a>
        </RibbonDitherBanner>
      </div>

      {/* Nav pill */}
      <div className="mx-auto flex max-w-content items-center justify-between px-6 md:px-10 lg:px-12 py-2">
        <nav className="flex w-full items-center justify-between rounded-full border border-rule bg-paper/80 backdrop-blur-md px-5 py-2.5">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-ink font-semibold text-lg">
            <span className="text-accent text-2xl leading-none">न</span>
            <span>Niyam</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink hover:bg-accent-hover transition-colors"
            >
              GitHub
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1 text-ink-muted hover:text-ink"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mx-6 mb-3 rounded-xl border border-rule bg-paper/95 backdrop-blur-md p-5">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
