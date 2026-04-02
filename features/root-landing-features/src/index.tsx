'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@xgen/i18n';
import './locales';
import {
  FiGrid,
  FiMessageCircle,
  FiTrendingUp,
  FiCpu,
  FiShield,
  FiGlobe,
} from '@xgen/icons';
import type { IntroductionSectionPlugin } from '@xgen/types';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  colorClass: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo';
}

const ICON_COLOR_CLASSES: Record<FeatureCardProps['colorClass'], string> = {
  blue:   'text-blue-600 bg-blue-600/[0.08]',
  purple: 'text-purple-600 bg-purple-600/[0.08]',
  green:  'text-emerald-600 bg-emerald-600/[0.08]',
  orange: 'text-orange-600 bg-orange-600/[0.08]',
  pink:   'text-pink-600 bg-pink-600/[0.08]',
  indigo: 'text-indigo-600 bg-indigo-600/[0.08]',
};

function FeatureCard({ icon, title, description, features, colorClass }: FeatureCardProps) {
  return (
    <div className="relative h-full group">
      <div className="absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100 bg-gradient-to-br from-blue-600/[0.06] to-purple-600/[0.04]" />
      <div className="relative bg-white py-8 px-7 rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] h-full flex flex-col group-hover:-translate-y-1 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] group-hover:border-gray-200">
        <div className="flex items-center mb-5">
          <span className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl [&_svg]:w-6 [&_svg]:h-6 ${ICON_COLOR_CLASSES[colorClass]}`}>{icon}</span>
          <h3 className="text-lg font-bold text-gray-900 m-0 ml-3.5 leading-tight">{title}</h3>
        </div>
        <p className="text-gray-600 m-0 mb-5 leading-relaxed text-[0.9375rem] grow">{description}</p>
        <div className="flex flex-col gap-1.5">
          {features.map((feature, index) => (
            <span key={index} className="text-[0.8125rem] text-gray-500 flex items-center before:content-['✓'] before:text-emerald-600 before:font-bold before:mr-2 before:text-xs">{feature}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingFeatures() {
  const { t } = useTranslation();

  const featureData = [
    { icon: <FiGrid />,          titleKey: 'features.visualCanvas',    colorClass: 'blue'   as const },
    { icon: <FiMessageCircle />, titleKey: 'features.realtimeChat',    colorClass: 'purple' as const },
    { icon: <FiTrendingUp />,    titleKey: 'features.smartManagement', colorClass: 'green'  as const },
    { icon: <FiCpu />,           titleKey: 'features.highPerformance', colorClass: 'orange' as const },
    { icon: <FiShield />,        titleKey: 'features.security',        colorClass: 'pink'   as const },
    { icon: <FiGlobe />,         titleKey: 'features.openEcosystem',   colorClass: 'indigo' as const },
  ];

  return (
    <section id="features" className="w-[90vw] sm:w-[88vw] lg:w-[85vw] xl:w-[80vw] max-w-[1400px] mx-auto my-12 lg:my-16 p-8 sm:p-12 lg:p-16 xl:py-28 xl:px-20 relative z-[1] bg-white/95 backdrop-blur-[24px] rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/60">
      <div className="text-center mb-14 [&_h2]:text-4xl [&_h2]:sm:text-[2.75rem] [&_h2]:font-extrabold [&_h2]:bg-gradient-to-br [&_h2]:from-gray-900 [&_h2]:to-blue-600 [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mb-3 [&_h2]:tracking-tight [&_p]:text-lg [&_p]:text-gray-600 [&_p]:max-w-[560px] [&_p]:mx-auto [&_p]:leading-relaxed">
        <h2>{t('features.title')}</h2>
        <p>{t('features.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:gap-10">
        {featureData.map((feature) => (
          <FeatureCard
            key={feature.titleKey}
            icon={feature.icon}
            title={t(`${feature.titleKey}.title`)}
            description={t(`${feature.titleKey}.description`)}
            features={[
              t(`${feature.titleKey}.feature1`),
              t(`${feature.titleKey}.feature2`),
              t(`${feature.titleKey}.feature3`),
            ]}
            colorClass={feature.colorClass}
          />
        ))}
      </div>
    </section>
  );
}

export const rootLandingFeaturesPlugin: IntroductionSectionPlugin = {
  id: 'root-landing-features',
  name: 'Landing Features',
  featuresComponent: LandingFeatures,
};

export default rootLandingFeaturesPlugin;
