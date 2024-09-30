import { Revision } from '~/models/revision';

export const mockWiki = {
  _id: 'f9853a14b354',
  title: 'Wiki',
  pages: [
    {
      _id: '001',
      title: 'ma nouvelle page',
      content: 'test modification',
      contentPlain: 'test modification',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1718207454421,
      },
      lastContributer: '123456789',
      lastContributerName: 'Author',
      isVisible: true,
    },
    {
      _id: '002',
      title: 'aaaa',
      content: 'rgrgrg aaz',
      contentPlain: 'rgrgrg aaz',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1718207659179,
      },
      lastContributer: '123456789',
      lastContributerName: 'Author',
      isVisible: true,
    },
    {
      _id: '003',
      title: 'test gras',
      content: 'ma super page',
      contentPlain: 'ma super page',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720193036074,
      },
      isVisible: true,
    },
    {
      _id: '004',
      title: 'zefzefzefzef',
      content: 'zefzefzef',
      contentPlain: 'zefzefzef',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720195498738,
      },
      isVisible: true,
    },
    {
      _id: '005',
      title: 'page parent 005 masquée',
      content: 'ma page parent 005 masquée',
      contentPlain: 'ma page parent 005 masquée',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720195498738,
      },
      isVisible: false,
    },
    {
      _id: '006',
      title: 'sous page 006 masquée de page parent 005 masquée',
      content: 'ma sous page 006 masquée de page parent 005 masquée',
      contentPlain: 'ma sous page 006 masquée de page parent 005 masquée',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720195498738,
      },
      isVisible: false,
      parentId: '005',
    },
    {
      _id: '007',
      title: 'page parent 007 visible',
      content: 'ma page parent 007 visible',
      contentPlain: 'ma page parent 007 visible',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720195498738,
      },
      isVisible: true,
    },
    {
      _id: '008',
      title: 'sous page 008 visible de page parent 007 visible',
      content: 'ma sous page 008 visible de page parent 007 visible',
      contentPlain: 'ma sous page 008 visible de page parent 007 visible',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720195498738,
      },
      isVisible: true,
      parentId: '007',
    },
  ],
  modified: {
    $date: 1718207659179,
  },
  owner: {
    userId: '123456789',
    displayName: 'Author',
  },
  index: '004',
  rights: [],
  thumbnail: 'wikiThumbnail.jpg',
};

export const mockWikis = [
  {
    _id: 'f9853a14b354',
    title: 'Wiki',
    modified: {
      $date: 1718207659179,
    },
    owner: {
      userId: '123456789',
      displayName: 'Author',
    },
    index: '004',
  },
  {
    _id: '2d5bcc14',
    title: 'Wiki',
    thumbnail: '',
    modified: {
      $date: 1716383468143,
    },
    owner: {
      userId: '123456789',
      displayName: 'Author',
    },
    index: '002',
  },
];

export const mockWikiPages = {
  pages: [
    {
      id: '668fa268f6b74f5fc8884cab',
      title: 'page 01',
      author: '4e6f1a98-4696-4b9b-be8f-18b3a372a555',
      authorName: 'Author',
      modified: {
        $date: 1720689256171,
      },
      comments: undefined,
    },
    {
      id: '668fa274f6b74f5fc8884cac',
      title: 'page 02',
      author: '4e6f1a98-4696-4b9b-be8f-18b3a372a555',
      authorName: 'Author',
      modified: {
        $date: 1720689268906,
      },
      comments: undefined,
    },
  ],
};

export const mockPage = {
  id: 'f9853a14b354',
  title: 'Wiki',
  pages: [
    {
      id: '001',
      title: 'ma nouvelle page',
      content: '',
      contentPlain: 'test modification',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1718207454421,
      },
      isVisible: false,
      lastContributer: '123456789',
      lastContributerName: 'Author',
    },
  ],
  owner: {
    userId: '123456789',
    displayName: 'Author',
  },
};

export const mockRevision: Revision[] = [
  {
    _id: '235ab109',
    wikiId: '6ef1343b',
    pageId: '6684fd',
    userId: '2875315d-rev',
    username: 'Author Rev',
    title: 'title rev',
    isVisible: true,
    content: 'content rev',
    date: {
      $date: 1720431608340,
    },
  },
  {
    _id: 'c7e68db2',
    wikiId: '6ef1343b',
    pageId: '6684fd',
    userId: '2875315d',
    username: 'Author',
    isVisible: true,
    title: 'title 2',
    content: '',
    date: {
      $date: 1720184598119,
    },
  },
  {
    _id: 'd7e68db2',
    wikiId: '6ef1343b',
    pageId: '6684fd',
    userId: '2875315d',
    username: 'Author',
    isVisible: false,
    title: 'title 3',
    content: '',
    date: {
      $date: 1720184598119,
    },
  },
];
