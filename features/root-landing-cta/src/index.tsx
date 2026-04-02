'use client';

import Link from 'next/link';
import { useTranslation } from '@xgen/i18n';
import './locales';
import { FiPlay, FiTrendingUp } from '@xgen/icons';
import type { IntroductionSectionPlugin } from '@xgen/types';

function LandingCta() {
  const { t } = useTranslation();

  return (
    <section className="w-[90vw] sm:w-[88vw] lg:w-[85vw] xl:w-[80vw] max-w-[1400px] mx-auto my-12 lg:my-16 relative bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/60 overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_20%_0%,rgba(37,99,235,0.04)_0%,transparent_60%),radial-gradient(ellipse_at_80%_100%,rgba(124,58,237,0.04)_0%,transparent_60%)] before:pointer-events-none">
      <div className="max-w-[720px] mx-auto py-20 px-8 sm:py-24 sm:px-12 lg:py-28 lg:px-16 xl:py-32 xl:px-20 text-center relative z-[1] [&_h2]:text-4xl [&_h2]:sm:text-[2.75rem] [&_h2]:font-extrabold [&_h2]:mb-4 [&_h2]:text-gray-900 [&_h2]:tracking-tight [&_p]:text-lg [&_p]:text-gray-600 [&_p]:mb-10 [&_p]:leading-relaxed">
        <div className="mb-5">
          <span className="inline-block bg-gradient-to-br from-blue-600/[0.08] to-purple-600/[0.06] border border-blue-600/[0.12] rounded-full py-2 px-5 text-blue-600 text-[0.8125rem] font-semibold tracking-wide">{t('cta.label')}</span>
        </div>
        <h2>{t('cta.title')}</h2>
        <p>{t('cta.description')}</p>
        <div className="flex gap-3.5 justify-center flex-wrap mb-6">
          <Link href="/canvas" className="inline-flex items-center justify-center no-underline cursor-pointer transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] border-none bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] font-semibold text-[0.9375rem] py-3.5 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] [&_svg]:mr-2 [&_svg]:w-[1.125rem] [&_svg]:h-[1.125rem]">
            <FiPlay />
            {t('cta.startFree')}
          </Link>
          <Link href="/main" className="inline-flex items-center justify-center no-underline cursor-pointer transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] bg-white text-gray-700 border border-gray-200 font-semibold text-[0.9375rem] py-3.5 px-8 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] [&_svg]:mr-2 [&_svg]:w-[1.125rem] [&_svg]:h-[1.125rem]">
            <FiTrendingUp />
            {t('cta.exploreManagement')}
          </Link>
        </div>
        <div className="[&_span]:text-[0.8125rem] [&_span]:text-gray-500">
          <span>{t('cta.note')}</span>
        </div>
      </div>
    </section>
  );
}

export const rootLandingCtaPlugin: IntroductionSectionPlugin = {
  id: 'root-landing-cta',
  name: 'Landing CTA',
  ctaComponent: LandingCta,
};

export default rootLandingCtaPlugin;
