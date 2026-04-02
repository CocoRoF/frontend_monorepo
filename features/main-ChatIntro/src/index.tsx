'use client';

import React from 'react';
import type { RouteComponentProps, MainFeatureModule } from '@xgen/types';
import { ContentArea } from '@xgen/ui';
import { useTranslation } from '@xgen/i18n';
import './locales';

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────

const ChatAiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 44C35.046 44 44 35.046 44 24C44 12.954 35.046 4 24 4C12.954 4 4 12.954 4 24C4 28.5 5.5 32.5 8 35.5L6 42L12.5 40C15.5 42.5 19.5 44 24 44Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 22C16 20.896 16.896 20 18 20H30C31.104 20 32 20.896 32 22V26C32 27.104 31.104 28 30 28H18C16.896 28 16 27.104 16 26V22Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="20" cy="24" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="24" r="1.5" fill="currentColor"/>
  </svg>
);

const MessageIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.75 11.25C15.75 11.6478 15.592 12.0294 15.3107 12.3107C15.0294 12.592 14.6478 12.75 14.25 12.75H5.25L2.25 15.75V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H14.25C14.6478 2.25 15.0294 2.40804 15.3107 2.68934C15.592 2.97064 15.75 3.35218 15.75 3.75V11.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6.75" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 5.25V9L11.25 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ArrowRightIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.75 9H14.25M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ZapIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Chat Introduction Page
// ─────────────────────────────────────────────────────────────

interface ChatIntroPageProps extends RouteComponentProps {
  onNavigate?: (sectionId: string) => void;
}

const ChatIntroPage: React.FC<ChatIntroPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  const handleStartNewChat = () => {
    onNavigate?.('new-chat');
  };

  const handleViewHistory = () => {
    onNavigate?.('chat-history');
  };

  return (
    <ContentArea>
      <div className="flex flex-col gap-12 p-12 max-w-[1200px] mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 py-12">
          <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 rounded-2xl text-white [&_svg]:w-12 [&_svg]:h-12">
            <ChatAiIcon />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('chatIntro.heroTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px] leading-relaxed">
            {t('chatIntro.heroDescription')}
          </p>

          <div className="flex gap-4 mt-4 max-[480px]:flex-col max-[480px]:w-full">
            <button onClick={handleStartNewChat} className="flex items-center gap-2 px-8 py-4 bg-primary text-white border-none rounded-lg text-base font-medium cursor-pointer transition-colors hover:bg-primary/90 [&_svg]:w-[18px] [&_svg]:h-[18px]">
              <MessageIcon />
              {t('chatIntro.startNewChat')}
              <ArrowRightIcon />
            </button>
            <button onClick={handleViewHistory} className="flex items-center gap-2 px-8 py-4 bg-transparent text-foreground border border-border rounded-lg text-base font-medium cursor-pointer transition-all hover:bg-muted hover:border-muted-foreground/40 [&_svg]:w-[18px] [&_svg]:h-[18px]">
              <ClockIcon />
              {t('chatIntro.viewHistory')}
            </button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
          <div className="flex flex-col gap-4 p-8 bg-white border border-border rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:m-0">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg text-primary [&_svg]:w-6 [&_svg]:h-6">
              <ChatAiIcon />
            </div>
            <h3>{t('chatIntro.features.naturalLanguage.title')}</h3>
            <p>{t('chatIntro.features.naturalLanguage.description')}</p>
          </div>

          <div className="flex flex-col gap-4 p-8 bg-white border border-border rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:m-0">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg text-primary [&_svg]:w-6 [&_svg]:h-6">
              <SearchIcon />
            </div>
            <h3>{t('chatIntro.features.contextSearch.title')}</h3>
            <p>{t('chatIntro.features.contextSearch.description')}</p>
          </div>

          <div className="flex flex-col gap-4 p-8 bg-white border border-border rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:m-0">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg text-primary [&_svg]:w-6 [&_svg]:h-6">
              <ZapIcon />
            </div>
            <h3>{t('chatIntro.features.toolIntegration.title')}</h3>
            <p>{t('chatIntro.features.toolIntegration.description')}</p>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="flex flex-col gap-6 p-8 bg-muted rounded-xl [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:m-0">
          <h3>{t('chatIntro.quickStart.title')}</h3>
          <div className="flex flex-col gap-6">
            <div className="flex gap-6">
              <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold shrink-0">1</div>
              <div className="flex flex-col gap-1 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:m-0">
                <h4>{t('chatIntro.quickStart.step1.title')}</h4>
                <p>{t('chatIntro.quickStart.step1.description')}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold shrink-0">2</div>
              <div className="flex flex-col gap-1 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:m-0">
                <h4>{t('chatIntro.quickStart.step2.title')}</h4>
                <p>{t('chatIntro.quickStart.step2.description')}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full text-sm font-bold shrink-0">3</div>
              <div className="flex flex-col gap-1 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:m-0">
                <h4>{t('chatIntro.quickStart.step3.title')}</h4>
                <p>{t('chatIntro.quickStart.step3.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="flex flex-col gap-6 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:m-0">
          <h3>{t('chatIntro.additionalFeatures.title')}</h3>
          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
            <div className="flex flex-col gap-2 p-6 bg-white border border-border rounded-lg [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:m-0">
              <h4>{t('chatIntro.additionalFeatures.multimodal.title')}</h4>
              <p>{t('chatIntro.additionalFeatures.multimodal.description')}</p>
            </div>
            <div className="flex flex-col gap-2 p-6 bg-white border border-border rounded-lg [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:m-0">
              <h4>{t('chatIntro.additionalFeatures.history.title')}</h4>
              <p>{t('chatIntro.additionalFeatures.history.description')}</p>
            </div>
            <div className="flex flex-col gap-2 p-6 bg-white border border-border rounded-lg [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:m-0 [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:m-0">
              <h4>{t('chatIntro.additionalFeatures.workflow.title')}</h4>
              <p>{t('chatIntro.additionalFeatures.workflow.description')}</p>
            </div>
          </div>
        </section>
      </div>
    </ContentArea>
  );
};

// ─────────────────────────────────────────────────────────────
// Feature Export
// ─────────────────────────────────────────────────────────────

export const mainChatIntroFeature: MainFeatureModule = {
  id: 'main-ChatIntro',
  name: 'Chat Introduction',
  sidebarSection: 'chat',
  sidebarItems: [
    {
      id: 'chat-intro',
      titleKey: 'sidebar.chat.intro.title',
      descriptionKey: 'sidebar.chat.intro.description',
    },
  ],
  routes: {
    'chat-intro': ChatIntroPage,
  },
  requiresAuth: true,
};

export default mainChatIntroFeature;
