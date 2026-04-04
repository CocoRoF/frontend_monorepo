// ─────────────────────────────────────────────────────────────
// MypageSidebar Configuration
// i18n key 기반 — 런타임에 t()로 변환
// AdminSidebar와 동일한 구조
// ─────────────────────────────────────────────────────────────

import type { SidebarSection } from '@xgen/types';

export interface MypageSidebarSectionConfig {
  id: string;
  titleKey: string;
  items: {
    id: string;
    titleKey: string;
    descriptionKey?: string;
  }[];
}

export const mypageSidebarConfig: MypageSidebarSectionConfig[] = [
  {
    id: 'mypage-profile',
    titleKey: 'mypage.sidebar.sections.profile',
    items: [
      {
        id: 'profile',
        titleKey: 'mypage.sidebar.profile',
        descriptionKey: 'mypage.sidebar.profileDesc',
      },
      {
        id: 'profile-edit',
        titleKey: 'mypage.sidebar.profileEdit',
        descriptionKey: 'mypage.sidebar.profileEditDesc',
      },
    ],
  },
  {
    id: 'mypage-settings',
    titleKey: 'mypage.sidebar.sections.settings',
    items: [
      {
        id: 'settings',
        titleKey: 'mypage.sidebar.settings',
        descriptionKey: 'mypage.sidebar.settingsDesc',
      },
      {
        id: 'security',
        titleKey: 'mypage.sidebar.security',
        descriptionKey: 'mypage.sidebar.securityDesc',
      },
      {
        id: 'notifications',
        titleKey: 'mypage.sidebar.notifications',
        descriptionKey: 'mypage.sidebar.notificationsDesc',
      },
    ],
  },
];

export function toSidebarSections(configs: MypageSidebarSectionConfig[]): SidebarSection[] {
  return configs.map((cfg) => ({
    id: cfg.id,
    titleKey: cfg.titleKey,
    items: cfg.items.map((item) => ({
      id: item.id,
      titleKey: item.titleKey,
      descriptionKey: item.descriptionKey,
    })),
  }));
}
