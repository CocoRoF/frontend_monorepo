'use client';

import { useTranslation } from '@xgen/i18n';
import './locales';
import type { IntroductionSectionPlugin } from '@xgen/types';

function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white relative w-screen ml-[calc(-50vw+50%)] mt-8 before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_25%_50%,rgba(37,99,235,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_75%_50%,rgba(124,58,237,0.06)_0%,transparent_50%)] before:pointer-events-none">
      <div className="max-w-[1400px] mx-auto pt-16 pb-10 px-8 sm:px-12 lg:px-16 xl:pt-24 xl:pb-12 xl:px-20 relative z-[1]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h3 className="text-[1.375rem] font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent m-0 mb-1.5">{t('footer.brand')}</h3>
            <p className="text-[0.9375rem] text-white/60 m-0">{t('footer.tagline')}</p>
          </div>
        </div>
        <div className="border-t border-white/[0.08] pt-6 text-center [&_p]:text-[0.8125rem] [&_p]:text-white/40 [&_p]:m-0">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}

export const rootLandingFooterPlugin: IntroductionSectionPlugin = {
  id: 'root-landing-footer',
  name: 'Landing Footer',
  footerComponent: LandingFooter,
};

export default rootLandingFooterPlugin;
