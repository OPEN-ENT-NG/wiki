import { http, HttpResponse } from 'msw';
import { baseURL } from '~/services';
import {
  mockPage,
  mockRevision,
  mockWiki,
  mockWikiPagesWithoutContent,
  mockWikis,
  mockWikisAsResources,
  mockWikisWithPages,
  mockWikiWithOnePage,
} from '.';

const defaultHandlers = [
  http.get('/userbook/preference/apps', () => {
    return HttpResponse.json({
      preference: '{"bookmarks":[],"applications":["FakeApp"]}',
    });
  }),

  http.get('/i18n', () => {
    return HttpResponse.json({ status: 200 });
  }),

  http.get('/userbook/api/person', () => {
    return HttpResponse.json({
      status: 'ok',
      result: [
        {
          id: 'a1b2c3d4',
          login: 'fake.user',
          displayName: 'Fake User',
          type: ['Personnel'],
          visibleInfos: [],
          schools: [
            {
              exports: null,
              classes: [],
              name: 'Fake School',
              id: 'd4c3b2a1',
              UAI: null,
            },
          ],
          relatedName: null,
          relatedId: null,
          relatedType: null,
          userId: 'a1b2c3d4',
          motto: 'Always Learning',
          photo: '/userbook/avatar/a1b2c3d4',
          mood: 'happy',
          health: 'good',
          address: '123 Fake Street',
          email: 'fake.user@example.com',
          tel: '1234567890',
          mobile: '0987654321',
          birthdate: '1990-01-01',
          hobbies: ['reading', 'coding'],
        },
      ],
    });
  }),

  http.get('/theme', () => {
    return HttpResponse.json({
      template: '/public/template/portal.html',
      logoutCallback: '',
      skin: '/assets/themes/fake/skins/default/',
      themeName: 'fake-theme',
      skinName: 'default',
    });
  }),

  http.get('/locale', () => {
    return HttpResponse.json({ locale: 'fr' });
  }),

  http.get('/directory/userbook/a1b2c3d4', () => {
    return HttpResponse.json({
      mood: 'happy',
      health: 'good',
      alertSize: false,
      storage: 12345678,
      type: 'USERBOOK',
      userid: 'a1b2c3d4',
      picture: '/userbook/avatar/a1b2c3d4',
      quota: 104857600,
      motto: 'Always Learning',
      theme: 'default',
      hobbies: ['reading', 'coding'],
    });
  }),

  http.get('/userbook/preference/language', () => {
    return HttpResponse.json({
      preference: '{"default-domain":"fr"}',
    });
  }),

  http.get('/workspace/quota/user/a1b2c3d4', () => {
    return HttpResponse.json({ quota: 104857600, storage: 12345678 });
  }),

  http.get('/auth/oauth2/userinfo', () => {
    return HttpResponse.json({
      classNames: null,
      level: '',
      login: 'fake.admin',
      lastName: 'Admin',
      firstName: 'Fake',
      externalId: 'abcd1234-5678-90ef-ghij-klmn1234opqr',
      federated: null,
      birthDate: '1980-01-01',
      forceChangePassword: null,
      needRevalidateTerms: false,
      deletePending: false,
      username: 'fake.user',
      type: 'ADMIN',
      hasPw: true,
      functions: {
        SUPER_ADMIN: {
          code: 'SUPER_ADMIN',
          scope: null,
        },
      },
      groupsIds: ['group1-1234567890', 'group2-0987654321'],
      federatedIDP: null,
      optionEnabled: [],
      userId: 'a1b2c3d4',
      structures: ['d4c3b2a1'],
      structureNames: ['Fake School'],
      uai: [],
      hasApp: false,
      ignoreMFA: true,
      classes: [],
      authorizedActions: [
        {
          name: 'org.entcore.fake.controllers.FoldersController|add',
          displayName: 'fake.createFolder',
          type: 'SECURED_ACTION_WORKFLOW',
        },
        {
          name: 'org.entcore.fake.controllers.FoldersController|list',
          displayName: 'fake.listFolders',
          type: 'SECURED_ACTION_WORKFLOW',
        },
        {
          name: 'org.entcore.fake.controllers.FakeController|print',
          displayName: 'fake.print',
          type: 'SECURED_ACTION_WORKFLOW',
        },
      ],
      apps: [
        {
          name: 'FakeApp',
          address: '/fake',
          icon: 'fake-large',
          target: '',
          displayName: 'fake',
          display: true,
          prefix: '/fake',
          casType: null,
          scope: [''],
          isExternal: false,
        },
      ],
      childrenIds: [],
      children: {},
      widgets: [],
      sessionMetadata: {},
    });
  }),

  http.get('/userbook/preference/rgpdCookies', () => {
    return HttpResponse.json({ preference: '{"showInfoTip":true}' });
  }),

  http.get('/applications-list', () => {
    return HttpResponse.json({
      apps: [
        {
          name: 'FakeApp',
          address: '/fake',
          icon: 'fake-large',
          target: '',
          displayName: 'fake',
          display: true,
          prefix: '/fake',
          casType: null,
          scope: [''],
          isExternal: false,
        },
      ],
    });
  }),

  http.get('/assets/theme-conf.js', () => {
    return HttpResponse.json({
      overriding: [
        {
          parent: 'theme-open-ent',
          child: 'fake-theme',
          skins: ['default', 'colorful'],
          help: '/help-fake',
          bootstrapVersion: 'ode-bootstrap-fake',
          edumedia: {
            uri: 'https://www.fake-edumedia.com',
            pattern: 'uai-token-hash-[[uai]]',
            ignoreSubjects: ['fake-92', 'fake-93'],
          },
        },
        {
          parent: 'panda',
          child: 'fake-panda',
          skins: [
            'circus',
            'desert',
            'neutre',
            'ocean',
            'fake-food',
            'sparkly',
            'default',
            'monthly',
          ],
          help: '/help-fake-panda',
          bootstrapVersion: 'ode-bootstrap-fake',
          edumedia: {
            uri: 'https://junior.fake-edumedia.com',
            pattern: 'uai-token-hash-[[uai]]',
          },
        },
      ],
    });
  }),
];

/**
 * MSW Handlers
 */
export const handlers = [
  ...defaultHandlers,
  http.get(`${baseURL}/listallpages`, () => {
    return HttpResponse.json(mockWikisWithPages, { status: 200 });
  }),
  http.get(`${baseURL}/list`, () => {
    return HttpResponse.json(mockWikis, { status: 200 });
  }),
  http.get(`${baseURL}/:wikiId`, () => {
    return HttpResponse.json(mockWiki, { status: 200 });
  }),
  http.get(`${baseURL}/:wikiId/pages`, ({ request }) => {
    const url = new URL(request.url);
    const content = url.searchParams.get('content');

    if (content === 'true') {
      return HttpResponse.json(mockWiki, { status: 200 });
    } else {
      return HttpResponse.json(mockWikiPagesWithoutContent, { status: 200 });
    }
  }),
  http.get(`${baseURL}/:wikiId/page/:pageId`, () => {
    return HttpResponse.json(mockPage, { status: 200 });
  }),
  http.get(`${baseURL}/${mockWiki._id}/page/:pageId/revisions`, () => {
    return HttpResponse.json(mockRevision, { status: 200 });
  }),
  http.post(`${baseURL}/:wikiId/page`, async ({ request }) => {
    const newPage = await request.json();
    return HttpResponse.json(newPage, { status: 201 });
  }),
  http.put(`${baseURL}/:wikiId/page/:pageId`, async () => {
    return HttpResponse.json({ number: 1 }, { status: 200 });
  }),
  http.delete(`wiki/:wikiId/page/:pageId`, () => {
    return HttpResponse.json({ number: 0 });
  }),
  http.get('/wiki/conf/public', () => {
    return HttpResponse.json({
      ID_SERVICE: {
        default: 2,
      },
      LIBELLE_SERVICE: {
        default: 'PRODUCTION_COLLABORATIVE',
      },
    });
  }),
  http.get(`${baseURL}/${mockWiki._id}/page/:pageId/revisions/:version`, () => {
    return HttpResponse.json(mockRevision[0], { status: 200 });
  }),
  http.get(`/explorer/resources`, () => {
    return HttpResponse.json(
      { resources: mockWikisAsResources },
      { status: 200 },
    );
  }),
  http.post(`${baseURL}/:wikiId/page/:pageId/duplicate`, () => {
    return HttpResponse.json(
      {
        newPageIds: [
          {
            wikiId: mockWikiWithOnePage._id,
            pageId: mockWikiWithOnePage.pages[0]._id,
          },
        ],
      },
      { status: 200 },
    );
  }),
];
