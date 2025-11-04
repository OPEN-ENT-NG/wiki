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
  extends PagesAssistantAIStep1FormValues,
    PagesAssistantAIStep2FormValues {}

export interface PagesAssistantAIStructureRequest
  extends PagesAssistantAIFormValues {
  wikiId: string;
  userId: string;
  session: string; // session ID
  browser: string; // browser information
}

// ==================================
// Types for Pages Structure API
// ==================================
export interface PagesAssistantAIStructureResponse {
  status: string;
  message: string;
  model: string;
  version: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  data: PagesAssistantAIStructureResponseData;
}

export interface PagesAssistantAIStructureResponseData {
  title: string;
  description: string;
  pages: PageStructure[];
  thumbnail: string;
  created: string;
  modified: string;
  owner: { userId: string; displayName: string };
}

export interface PageStructure {
  title: string;
  isVisible: boolean;
  position: number;
  author: string;
  authorName: string;
  modified: string;
  created: string;
  lastContributer: string;
  lastContributerName: string;
}

// ==================================
// Types for Pages Content API
// ==================================
export interface PagesAssistantAIContentResponse {
  status: string;
  message: string;
  model: string;
  version: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  data: PagesAssistantAIContentResponseData;
}

export interface PagesAssistantAIContentResponseData {
  title: string;
  description: string;
  pages: PageContent[];
  thumbnail: string;
  created: string;
  modified: string;
  owner: { userId: string; displayName: string };
}

export interface PageContent extends PageStructure {
  content: string;
}
