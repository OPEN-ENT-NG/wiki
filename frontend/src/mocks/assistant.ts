import {
  PagesAssistantAIContentResponseData,
  PagesAssistantAIStructureResponseData,
} from '~/services/api/assistant/assistant.types';

// ==================================
// Mocked Pages Structure Data
// ==================================
export const mockPagesStructureResponse: PagesAssistantAIStructureResponseData =
  {
    title: 'Intelligence Artificielle',
    description:
      'Cours généré automatiquement sur le thème: Intelligence Artificielle',
    pages: [
      {
        title: 'Intelligence Artificielle',
        isVisible: true,
        position: 1,
        author: 'test-user-123',
        authorName: 'User_test-use',
        modified: '2025-10-22T13:28:02.093260',
        created: '2025-10-22T13:28:02.093260',
        lastContributer: 'test-user-123',
        lastContributerName: 'User_test-use',
      },
      {
        title: 'Introduction',
        isVisible: true,
        position: 2,
        author: 'test-user-123',
        authorName: 'User_test-use',
        modified: '2025-10-22T13:28:02.093260',
        created: '2025-10-22T13:28:02.093260',
        lastContributer: 'test-user-123',
        lastContributerName: 'User_test-use',
      },
      {
        title: "Types d'IA",
        isVisible: true,
        position: 3,
        author: 'test-user-123',
        authorName: 'User_test-use',
        modified: '2025-10-22T13:28:02.093260',
        created: '2025-10-22T13:28:02.093260',
        lastContributer: 'test-user-123',
        lastContributerName: 'User_test-use',
      },
      {
        title: 'Applications pratiques',
        isVisible: true,
        position: 4,
        author: 'test-user-123',
        authorName: 'User_test-use',
        modified: '2025-10-22T13:28:02.093260',
        created: '2025-10-22T13:28:02.093260',
        lastContributer: 'test-user-123',
        lastContributerName: 'User_test-use',
      },
    ],
    thumbnail: '',
    created: '2025-10-22T13:28:02.093260',
    modified: '2025-10-22T13:28:02.093260',
    owner: { userId: 'test-user-123', displayName: 'User_test-use' },
  };

// ==================================
// Mocked Pages Content Data
// ==================================
export const mockPagesContentResponse: PagesAssistantAIContentResponseData = {
  title: 'Intelligence Artificielle',
  description:
    'Cours généré automatiquement sur le thème: Intelligence Artificielle',
  pages: [
    {
      title: 'Intelligence Artificielle',
      isVisible: true,
      position: 1,
      author: 'test-user-123',
      authorName: 'User_test-use',
      modified: '2025-10-22T13:28:02.093260',
      created: '2025-10-22T13:28:02.093260',
      lastContributer: 'test-user-123',
      lastContributerName: 'User_test-use',
      content: "Contenu de la page sur l'Intelligence Artificielle...",
    },
    {
      title: 'Introduction',
      isVisible: true,
      position: 2,
      author: 'test-user-123',
      authorName: 'User_test-use',
      modified: '2025-10-22T13:28:02.093260',
      created: '2025-10-22T13:28:02.093260',
      lastContributer: 'test-user-123',
      lastContributerName: 'User_test-use',
      content: "Contenu de la page d'introduction...",
    },
    {
      title: "Types d'IA",
      isVisible: true,
      position: 3,
      author: 'test-user-123',
      authorName: 'User_test-use',
      modified: '2025-10-22T13:28:02.093260',
      created: '2025-10-22T13:28:02.093260',
      lastContributer: 'test-user-123',
      lastContributerName: 'User_test-use',
      content: "Contenu de la page sur les types d'IA...",
    },
    {
      title: 'Applications pratiques',
      isVisible: true,
      position: 4,
      author: 'test-user-123',
      authorName: 'User_test-use',
      modified: '2025-10-22T13:28:02.093260',
      created: '2025-10-22T13:28:02.093260',
      lastContributer: 'test-user-123',
      lastContributerName: 'User_test-use',
      content: 'Contenu de la page sur les applications pratiques...',
    },
  ],
  thumbnail: '',
  created: '2025-10-22T13:28:02.093260',
  modified: '2025-10-22T13:28:02.093260',
  owner: { userId: 'test-user-123', displayName: 'User_test-use' },
};
