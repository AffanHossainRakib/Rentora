import { MotionRoot } from "@/app/_components/motion-root";
import { BrandLoader } from "@/app/_components/brand-loader";
import { BackToTop } from "@/app/_components/back-to-top";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MotionRoot />
      <BrandLoader />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
