export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/25 px-5 py-5 text-center text-sm text-white/80">
      <p>
        © {year} Kadoudhal —{" "}
        <span className="font-arabic text-base text-gold" dir="rtl">
          أهلاً وسهلاً ومرحباً بكم
        </span>
      </p>
    </footer>
  );
}
