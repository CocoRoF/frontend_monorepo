import type { TranslationData } from '@xgen/i18n';

export const en: TranslationData = {
  searchPlaceholder: 'Search library...',
  filter: {
    all: 'All',
    my: 'My Uploads',
  },
  types: {
    system: 'System',
    user: 'User',
  },
  badges: {
    template: 'Template',
  },
  actions: {
    download: 'Download',
    delete: 'Delete',
  },
  buttons: {
    retry: 'Retry',
  },
  card: {
    rating: '{{rating}}/5 ({{count}})',
    noRating: 'No ratings',
  },
  empty: {
    title: 'No prompts in library',
    description: 'Upload a prompt from your storage to share with others',
  },
  error: {
    title: 'Failed to load',
    loadFailed: 'Failed to load library prompts. Please try again.',
  },
  confirm: {
    delete: 'Are you sure you want to remove "{{name}}" from the library?',
    deleteTitle: 'Remove from Library',
    confirmDelete: 'Remove',
    cancel: 'Cancel',
  },
  messages: {
    loadingAuth: 'Loading...',
    downloadSuccess: 'Prompt downloaded to your storage',
    downloadFailed: 'Failed to download prompt',
    deleteSuccess: '"{{name}}" has been removed from the library',
    deleteFailed: 'Failed to remove "{{name}}"',
    rateSuccess: 'Rated {{rating}} stars',
    rateFailed: 'Failed to rate prompt',
    loginRequired: 'Login required',
  },
  modal: {
    close: 'Close',
    copy: 'Copy',
    copyContent: 'Copy Content',
    copied: 'Copied',
    contentLabel: 'Prompt Content',
    variables: 'Variables',
    charCount: 'Characters',
    isTemplate: 'Template',
    yes: 'Yes',
    no: 'No',
    rateThisPrompt: 'Rate this prompt',
  },
  upload: {
    title: 'Upload to Library',
    cancel: 'Cancel',
    submit: 'Upload ({{count}})',
    uploading: 'Uploading...',
    loading: 'Loading your prompts...',
    noPrompts: 'No private prompts available to upload',
    selectAll: 'Select All',
    selectedCount: '{{count}} selected',
    success: '{{count}} prompt(s) uploaded to library',
    errors: {
      loadFailed: 'Failed to load your prompts',
      uploadFailed: 'Failed to upload',
    },
  },
};
