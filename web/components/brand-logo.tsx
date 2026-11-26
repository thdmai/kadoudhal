import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  /** `dark` = fond sombre (header site), `light` = fond clair (admin) */
  variant?: "dark" | "light";
  subtitle?: string;
  className?: string;
};

const markClass =
  "flex size-9 shrink-0 items-center justify-center rounded-md font-arabic text-lg font-semibold text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2";

const markStyle = {
  background: "linear-gradient(145deg, #1a3c2c 0%, #2d6a4f 55%, #40916c 100%)",
  color: "#ffffff",
} as const;

export function BrandLogo({
  href = "/",
  variant = "dark",
  subtitle,
  className = "",
}: BrandLogoProps) {
  const titleClass =
    variant === "dark"
      ? "font-display text-xl tracking-wide text-white sm:text-2xl"
      : "font-display text-xl text-[var(--admin-ink)]";

  const content = (
    <>
      <span className={markClass} style={markStyle}>
        ك
      </span>
      <span className="min-w-0">
        <span className={`block ${titleClass}`}>Kadoudhal</span>
        {subtitle ? (
          <span className="block text-xs tracking-wide text-[var(--admin-muted)] uppercase">
            {subtitle}
          </span>
        ) : variant === "dark" ? (
          <span className="block font-arabic text-sm text-gold">كدودال</span>
        ) : null}
      </span>
    </>
  );

  if (!href) {
    return (
      <span className={`group inline-flex items-center gap-3 ${className}`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      {content}
    </Link>
  );
}
