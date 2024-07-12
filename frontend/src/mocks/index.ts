import { http, HttpResponse } from 'msw';
import { baseURL } from '~/services/api';

export const mockWiki = {
  _id: 'f9853a14b354',
  title: 'Wiki',
  pages: [
    {
      _id: '001',
      title: 'ma nouvelle page',
      contentPlain: 'test modification',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1718207454421,
      },
      lastContributer: '123456789',
      lastContributerName: 'Author',
    },
    {
      _id: '002',
      title: 'aaaa',
      contentPlain: 'rgrgrg aaz',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1718207659179,
      },
      lastContributer: '123456789',
      lastContributerName: 'Author',
    },
    {
      _id: '003',
      title: 'test gras',
      contentPlain: 'ma super page',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720193036074,
      },
    },
    {
      _id: '004',
      title: 'zefzefzefzef',
      contentPlain: 'zefzefzef',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1720195498738,
      },
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
      _id: '668fa268f6b74f5fc8884cab',
      title: 'page 01',
      author: '4e6f1a98-4696-4b9b-be8f-18b3a372a555',
      authorName: 'Author',
      modified: {
        $date: 1720689256171,
      },
    },
    {
      _id: '668fa274f6b74f5fc8884cac',
      title: 'page 02',
      author: '4e6f1a98-4696-4b9b-be8f-18b3a372a555',
      authorName: 'Author',
      modified: {
        $date: 1720689268906,
      },
    },
  ],
};

export const mockPage = {
  _id: 'f9853a14b354',
  title: 'Wiki',
  pages: [
    {
      _id: '001',
      title: 'ma nouvelle page',
      content: '',
      contentPlain: 'test modification',
      author: '123456789',
      authorName: 'Author',
      modified: {
        $date: 1718207454421,
      },
      lastContributer: '123456789',
      lastContributerName: 'Author',
    },
  ],
  owner: {
    userId: '123456789',
    displayName: 'Author',
  },
};

export const mockRevision = [
  {
    _id: '235ab109',
    wikiId: '6ef1343b',
    pageId: '6684fd',
    userId: '2875315d',
    username: 'Author',
    title: 'title',
    content: '',
    date: {
      $date: 1720431608339,
    },
  },
  {
    _id: 'c7e68db2',
    wikiId: '6ef1343b',
    pageId: '6684fd',
    userId: '2875315d',
    username: 'Author',
    title: 'title',
    content: '',
    date: {
      $date: 1720184598119,
    },
  },
];

/**
 * MSW Handlers
 */
export const handlers = [
  http.get(`/wiki/list`, () => {
    return HttpResponse.json(mockWikis, { status: 200 });
  }),
  http.get(`/wiki/:wikiId`, () => {
    return HttpResponse.json(mockWiki, { status: 200 });
  }),
  http.get(`/wiki/:wikiId/pages`, () => {
    return HttpResponse.json(mockWikiPages, { status: 200 });
  }),
  http.get(`/wiki/:wikiId/page/:pageId`, () => {
    return HttpResponse.json(mockPage);
  }),
  http.get(`${baseURL}/revisions/${mockWiki._id}/:pageId`, () => {
    return HttpResponse.json(mockRevision, { status: 200 });
  }),
  http.post(`/wiki/:wikiId/page`, async ({ request }) => {
    const newPage = await request.json();
    return HttpResponse.json(newPage, { status: 201 });
  }),
  http.put(`/wiki/:wikiId/page/:pageId`, async ({ request }) => {
    return HttpResponse.json({ number: 1 }, { status: 200 });
  }),
  http.delete(`wiki/:wikiId/page/:pageId`, () => {
    return HttpResponse.json({ number: 0 });
  }),
];
