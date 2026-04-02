'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@xgen/i18n';
import './locales';
import { FiArrowRight, FiLogOut } from '@xgen/icons';
import type { IntroductionSectionPlugin, IntroductionHeaderProps } from '@xgen/types';

function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  return (
    <div className="flex items-center gap-1 [&_button]:py-1.5 [&_button]:px-2.5 [&_button]:rounded-md [&_button]:text-xs [&_button]:font-semibold [&_button]:cursor-pointer [&_button]:border-none [&_button]:transition-all [&_button]:duration-200 [&_button]:tracking-wide">
      <button
        className={locale === 'ko' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        onClick={() => setLocale('ko')}
        aria-label="한국어로 변경"
      >
        KOR
      </button>
      <button
        className={locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        onClick={() => setLocale('en')}
        aria-label="Change to English"
      >
        ENG
      </button>
    </div>
  );
}

export function LandingHeader({ user, onLogout }: IntroductionHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/85 backdrop-blur-[20px] border-b border-slate-400/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300">
      <nav className="max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-80">
            <Image src="/simbol.png" alt="XGEN" height={24} width={24} />
            <h1 className="text-2xl font-bold ml-[3px] bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight translate-y-px -translate-x-[3.1px]">{t('header.title').replace(/ /g, '\u00A0')}</h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center py-2 px-4 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-black/[0.04] hover:-translate-y-px"
                  onClick={() => router.push('/mypage')}
                  title={t('common.mypage')}
                >
                  {t('common.welcome').replace('{username}', user.username)}
                </span>
                <button
                  onClick={onLogout}
                  className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2 cursor-pointer transition-all duration-200 flex items-center justify-center w-9 h-9 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-px [&_svg]:w-4 [&_svg]:h-4"
                  title={t('common.logout')}
                >
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <Link href="/login?redirect=%2F" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 px-5 rounded-lg text-sm font-medium no-underline cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] [&_svg]:w-4 [&_svg]:h-4">
                {t('common.login')}
                <FiArrowRight />
              </Link>
            )}
            <Link href="/main" className="inline-flex items-center py-2.5 px-5 border-none rounded-lg font-semibold no-underline transition-all duration-200 cursor-pointer bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-sm hover:from-blue-700 hover:to-purple-700 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] [&_svg]:ml-2 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5">
              {t('common.getStarted')}
              <FiArrowRight />
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </nav>
    </header>
  );
}

export const rootLandingHeaderPlugin: IntroductionSectionPlugin = {
  id: 'root-landing-header',
  name: 'Landing Header',
  headerComponent: LandingHeader,
};

export default rootLandingHeaderPlugin;
