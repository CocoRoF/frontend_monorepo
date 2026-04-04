import { registerFeatureTranslations } from '@xgen/i18n';
import { ko } from './ko';
import { en } from './en';

// Documents 번역 등록
registerFeatureTranslations('documents', { ko, en });

export { ko, en };
