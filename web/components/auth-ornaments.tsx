/** Titre FR + arabe sur la même ligne (comme le reste du site). */
export function AuthHeading({
  title,
  arabic,
}: {
  title: string;
  arabic: string;
}) {
  return (
    <div className="mb-1 text-center">
      <h1 className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-display text-3xl font-semibold text-[var(--auth-text)] sm:text-4xl">
        <span>{title}</span>
        <span className="text-[var(--auth-muted)]" aria-hidden>
          —
        </span>
        <span
          className="font-arabic text-2xl text-[var(--auth-accent)] sm:text-3xl"
          dir="rtl"
          lang="ar"
        >
          {arabic}
        </span>
      </h1>
    </div>
  );
}
