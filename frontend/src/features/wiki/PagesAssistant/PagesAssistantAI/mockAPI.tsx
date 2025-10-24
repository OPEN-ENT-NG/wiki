export const mockPagesStructureApiResponse = {
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

export const mockPagesStructureApiCall = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        message: 'Course has been successfully generated.',
        model: 'gpt-4.1-mini-2025-04-14',
        version: '0.1.0',
        usage: {
          completion_tokens: 2910,
          prompt_tokens: 1372,
          total_tokens: 4282,
        },
        data: mockPagesStructureApiResponse,
      });
    }, 10000); // 10 seconds delay
  });
};
