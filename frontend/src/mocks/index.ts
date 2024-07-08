import { http, HttpResponse } from 'msw';
import { baseURL } from '~/services/api';

export const mockWiki = {
  _id: '6e3d23f6-890f-4453-af19-f9853a14b354',
  title: 'Wiki Clément',
  pages: [
    {
      _id: '6669c22b1b543d54ee3d804e',
      title: 'ma nouvelle page',
      contentPlain: 'test modification',
      author: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      authorName: 'Madame isabelle POLONIO (prof arts plastiques)',
      modified: {
        $date: 1718207454421,
      },
      lastContributer: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      lastContributerName: 'Madame isabelle POLONIO (prof arts plastiques)',
    },
    {
      _id: '6669c3e939d30a7f7e7ada17',
      title: 'aaaa',
      contentPlain: 'rgrgrg aaz',
      author: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      authorName: 'Madame isabelle POLONIO (prof arts plastiques)',
      modified: {
        $date: 1718207659179,
      },
      lastContributer: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      lastContributerName: 'Madame isabelle POLONIO (prof arts plastiques)',
    },
    {
      _id: '6688100c67c6ea0825d056b5',
      title: 'test gras',
      contentPlain: 'ma super page',
      author: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      authorName: 'Madame isabelle POLONIO (prof arts plastiques)',
      modified: {
        $date: 1720193036074,
      },
    },
    {
      _id: '668819aa359b28399237368f',
      title: 'zefzefzefzef',
      contentPlain: 'zefzefzef',
      author: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      authorName: 'Madame isabelle POLONIO (prof arts plastiques)',
      modified: {
        $date: 1720195498738,
      },
    },
  ],
  modified: {
    $date: 1718207659179,
  },
  owner: {
    userId: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
    displayName: 'Madame isabelle POLONIO (prof arts plastiques)',
  },
  index: '668819aa359b28399237368f',
};

export const mockWikis = [
  {
    _id: '6e3d23f6-890f-4453-af19-f9853a14b354',
    title: 'Wiki Clément',
    modified: {
      $date: 1718207659179,
    },
    owner: {
      userId: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      displayName: 'Madame isabelle POLONIO (prof arts plastiques)',
    },
    index: '668819aa359b28399237368f',
  },
  {
    _id: '2d5bcc14-53bd-4e3a-b886-012a993f9b2b',
    title: 'Les recettes provençales — Copie',
    thumbnail: '/workspace/document/f0ee4441-9f40-41ce-9235-8d1ff68a54fe',
    modified: {
      $date: 1716383468143,
    },
    owner: {
      userId: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      displayName: 'Madame isabelle POLONIO (prof arts plastiques)',
    },
    index: '664c580b17cf9a1d353b97d3',
  },
];

export const mockWikisWithPages = [
  {
    _id: '423a3e89-d3a4-4524-97e7-f476c71d9d6e',
    title: 'Définitions Espanol',
    pages: [
      {
        _id: '5540ede1e4b056471c495282',
        title: 'Acaparar',
        author: 'b6db229d-6dae-4949-a405-6ea685c05998',
        authorName: "SANDRINE BOUQUETY (Prof. d'espagnol)",
        modified: {
          $date: 1430318586054,
        },
        contentPlain: '',
      },
      {
        _id: '5540eec6e4b056471c495283',
        title: 'Resultar',
        author: '13f1e9f7-7192-4f75-9a6b-c1c7eefe0280',
        authorName: 'Patrick MOSSION',
        modified: {
          $date: 1501842229907,
        },
        contentPlain: '',
      },
      {
        _id: '5540ef0fe4b056471c495284',
        title: 'Lechería',
        author: 'b6db229d-6dae-4949-a405-6ea685c05998',
        authorName: "SANDRINE BOUQUETY (Prof. d'espagnol)",
        modified: {
          $date: 1430318863835,
        },
        contentPlain: '',
      },
      {
        _id: '580f3f8ee4b07ac1b023b2db',
        title: 'Accueil',
        contentPlain:
          'Quelques définitions des mots vus lors de la dernière séance :&nbsp;&nbsp;- Resultar&nbsp;&nbsp;- Lecheria&nbsp;&nbsp;- Acaparar',
        author: 'a87b39c0-9b23-42db-ade1-7675ae99e898',
        authorName: 'CLAIRE OGOULA-NKWEMI (documentaliste)',
        modified: {
          $date: 1478192151290,
        },
      },
      {
        _id: '657974cc736a590490395b4b',
        title: 'Titre',
        contentPlain: 'texte',
        author: '219a1774-f581-4386-acb3-1a0b06fbd159',
        authorName: 'DEVAULX ALAIN',
        modified: {
          $date: 1702458572178,
        },
      },
    ],
    owner: {
      userId: 'b6db229d-6dae-4949-a405-6ea685c05998',
      displayName: "SANDRINE BOUQUETY (Prof. d'espagnol)",
    },
    modified: {
      $date: 1501842229907,
    },
    thumbnail: '/workspace/document/33d77b15-cba9-41c8-9f83-f4a785752f18',
    shared: [],
    index: '580f3f8ee4b07ac1b023b2db',
  },
];

export const mockPage = {
  _id: '6e3d23f6-890f-4453-af19-f9853a14b354',
  title: 'Wiki Clément',
  pages: [
    {
      _id: '6669c22b1b543d54ee3d804e',
      title: 'ma nouvelle page',
      content:
        '\u003Cdiv class="ng-scope"\u003Etest modification\u003C/div\u003E',
      contentPlain: 'test modification',
      author: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      authorName: 'Madame isabelle POLONIO (prof arts plastiques)',
      modified: {
        $date: 1718207454421,
      },
      lastContributer: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
      lastContributerName: 'Madame isabelle POLONIO (prof arts plastiques)',
    },
  ],
  owner: {
    userId: '91c22b66-ba1b-4fde-a3fe-95219cc18d4a',
    displayName: 'Madame isabelle POLONIO (prof arts plastiques)',
  },
};

export const mockRevision = [
  {
    _id: '235ab109-0421-4251-8693-800740006661',
    wikiId: '6ef1343b-e07d-4bc4-828f-20a300e22a18',
    pageId: '6684fdce6a32ef3e1a62c92d',
    userId: '2875315d-48a2-46fd-b21a-4b6150761730',
    username: 'ADMC Clément',
    title: '22ma new page',
    content: '<div class="ng-scope">update</div>',
    date: {
      $date: 1720431608339,
    },
  },
  {
    _id: 'c7e68db2-88f6-4e1a-bbf5-cf7c8fbce895',
    wikiId: '6ef1343b-e07d-4bc4-828f-20a300e22a18',
    pageId: '6684fdce6a32ef3e1a62c92d',
    userId: '2875315d-48a2-46fd-b21a-4b6150761730',
    username: 'ADMC Clément',
    title: '22ma new page',
    content: '<div class="ng-scope">aaaaaaazezef 222</div>',
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
  http.get(`/wiki/listallpages`, () => {
    return HttpResponse.json(mockWikisWithPages, { status: 200 });
  }),
  http.get(`/wiki/:wikiId/listpages`, () => {
    return HttpResponse.json(mockWiki, { status: 200 });
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
