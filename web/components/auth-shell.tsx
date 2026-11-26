import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

type AuthShellProps = {
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

export async function AuthShell({
  children,
  imageSrc = "/images/auth-coran.jpg",
  imageAlt,
}: AuthShellProps) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const alt = imageAlt ?? dictionary.auth.imageAlt;

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="auth-panel grid w-full max-w-5xl overflow-hidden rounded-md border border-white/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:grid-cols-2">
          <aside className="relative hidden min-h-[26rem] md:block">
            <Image
              src={imageSrc}
              alt={alt}
              fill
              priority
              quality={90}
              sizes="(min-width: 768px) 40vw, 0px"
              className="object-cover object-center"
            />
          </aside>
          <main className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12">
            {children}
          </main>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
