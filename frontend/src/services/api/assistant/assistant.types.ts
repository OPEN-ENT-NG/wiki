// ==================================
// Types for Pages Assistant AI Form Data
// ==================================
export interface PagesAssistantAIStep1FormValues {
  level: string;
  subject: string;
  sequence: string;
}

export interface PagesAssistantAIStep2FormValues {
  keywords?: string;
}

export interface PagesAssistantAIFormValues
  extends PagesAssistantAIStep1FormValues, PagesAssistantAIStep2FormValues {}

export interface AssistantGenerateRequest extends PagesAssistantAIFormValues {
  wikiId: string;
}

// ==================================
// Types for Pages Structure API
// ==================================
export interface AssistantGenerateResponse {
  wikiId: string;
}

export interface PageStructure {
  title: string;
  // isVisible: boolean;
  // position: number;
  // author: string;
  // authorName: string;
  // modified: string;
  // created: string;
  // lastContributer: string;
  // lastContributerName: string;
}
