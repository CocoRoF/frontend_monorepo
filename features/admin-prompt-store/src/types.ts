export interface Prompt {
  id: number;
  prompt_uid: string;
  prompt_title: string;
  prompt_content: string;
  prompt_type: 'user' | 'system';
  public_available: boolean;
  is_template: boolean;
  language: string;
  user_id?: string;
  username?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  metadata?: unknown;
}

export interface PromptListResponse {
  prompts: Prompt[];
}
