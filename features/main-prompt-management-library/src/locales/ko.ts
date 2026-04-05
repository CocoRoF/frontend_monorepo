import type { TranslationData } from '@xgen/i18n';

export const ko: TranslationData = {
  searchPlaceholder: '라이브러리 검색...',
  filter: {
    all: '전체',
    my: '내 업로드',
  },
  types: {
    system: '시스템',
    user: '사용자',
  },
  badges: {
    template: '템플릿',
  },
  actions: {
    download: '다운로드',
    delete: '삭제',
  },
  buttons: {
    retry: '재시도',
  },
  card: {
    rating: '{{rating}}/5 ({{count}})',
    noRating: '평가 없음',
  },
  empty: {
    title: '라이브러리에 프롬프트가 없습니다',
    description: '저장소에서 프롬프트를 업로드하여 다른 사용자와 공유하세요',
  },
  error: {
    title: '불러오기 실패',
    loadFailed: '라이브러리 프롬프트를 불러오는데 실패했습니다. 다시 시도해주세요.',
  },
  confirm: {
    delete: '"{{name}}"을(를) 라이브러리에서 제거하시겠습니까?',
    deleteTitle: '라이브러리에서 제거',
    confirmDelete: '제거',
    cancel: '취소',
  },
  messages: {
    loadingAuth: '로딩 중...',
    downloadSuccess: '프롬프트가 저장소에 다운로드되었습니다',
    downloadFailed: '프롬프트 다운로드에 실패했습니다',
    deleteSuccess: '"{{name}}"이(가) 라이브러리에서 제거되었습니다',
    deleteFailed: '"{{name}}" 제거에 실패했습니다',
    rateSuccess: '{{rating}}점으로 평가되었습니다',
    rateFailed: '평가에 실패했습니다',
    loginRequired: '로그인이 필요합니다',
  },
  modal: {
    close: '닫기',
    copy: '복사',
    copyContent: '내용 복사',
    copied: '복사됨',
    contentLabel: '프롬프트 내용',
    variables: '변수',
    charCount: '문자 수',
    isTemplate: '템플릿',
    yes: '예',
    no: '아니오',
    rateThisPrompt: '이 프롬프트 평가하기',
  },
  upload: {
    title: '라이브러리에 업로드',
    cancel: '취소',
    submit: '업로드 ({{count}}개)',
    uploading: '업로드 중...',
    loading: '프롬프트 목록을 불러오는 중...',
    noPrompts: '업로드 가능한 비공개 프롬프트가 없습니다',
    selectAll: '모두 선택',
    selectedCount: '{{count}}개 선택됨',
    success: '{{count}}개 프롬프트가 라이브러리에 업로드되었습니다',
    errors: {
      loadFailed: '프롬프트 목록을 불러오는데 실패했습니다',
      uploadFailed: '업로드에 실패했습니다',
    },
  },
};
