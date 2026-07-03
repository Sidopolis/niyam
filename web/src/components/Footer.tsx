import { COPY } from "@/constants/copy";
import { LINKS } from "@/constants/links";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const footerColumns = [
  {
    title: "Pages",
    links: [
      { label: "Features", href: LINKS.features },
      { label: "MCP", href: LINKS.mcp },
      { label: "CLI", href: LINKS.cli },
      { label: "Docs", href: LINKS.docs },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "GitHub", href: LINKS.github },
      { label: "npm", href: LINKS.npm },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "MIT License", href: `${LINKS.github}/blob/main/LICENSE` },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="section-shell">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-ink">
              <span className="text-accent text-2xl leading-none">न</span>
              <span>{COPY.footer.brand}</span>
            </div>
            <p className="text-sm text-ink-muted">{COPY.footer.tagline}</p>
            <p className="text-xs text-ink-soft">{COPY.footer.copyright}</p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 md:gap-16">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs uppercase tracking-widest text-ink-soft font-medium mb-3">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm text-ink-muted hover:text-ink transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giant text hover effect */}
      <div className="h-40 md:h-56 flex items-center justify-center overflow-hidden">
        <TextHoverEffect text="NIYAM" />
      </div>
    </footer>
  );
}
