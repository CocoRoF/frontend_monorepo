import { registerFeatureTranslations } from '@xgen/i18n';
import { ko } from './ko';
import { en } from './en';

// Mypage 번역 등록
registerFeatureTranslations('mypage', { ko: ko.mypage as Record<string, unknown>, en: en.mypage as Record<string, unknown> });

export { ko, en };
