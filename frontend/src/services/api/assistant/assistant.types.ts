// ==================================
// Types for Pages Assistant AI Form Data
// ==================================
export interface PagesAssistantAIFormValues {
  level: string;
  subject: string;
  sequence: string;
  keywords: string;
}

export interface PagesStructureRequest extends PagesAssistantAIFormValues {
  wikiId: string;
  userId: string;
  session: string; // session ID
  browser: string; // browser information
}

// ==================================
// Types for Pages Structure API
// ==================================
export interface PagesStructureResponse {
  status: string;
  message: string;
  model: string;
  version: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  data: PagesStructureResponseData;
}

export interface PagesStructureResponseData {
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
export interface PagesContentResponse {
  status: string;
  message: string;
  model: string;
  version: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  data: PagesStructureResponseData;
}

export interface PagesContentResponseData {
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
