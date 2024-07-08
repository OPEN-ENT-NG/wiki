import { test } from 'vitest';
import { wikiMock, wikiPageMock, wikisMock, wikisMockWithPages } from '~/mocks';
import { server } from '~/mocks/node';
import { wikiService } from '..';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('Wiki GET Methods', () => {
  test('makes a GET request to get all wikis without pages', async () => {
    const response = await wikiService.getAllWiki();

    expect(response).toBeDefined();
    expect(response).toHaveLength(2);
    expect(response).toStrictEqual(wikisMock);
    expect(response).toMatchSnapshot();
  });

  test('makes a GET request to get all wikis with pages', async () => {
    const response = await wikiService.getAllWikiWithPages();

    expect(response).toBeDefined();
    expect(response).toStrictEqual(wikisMockWithPages);
  });

  test('makes a GET request to get one wiki with pages', async () => {
    const response = await wikiService.getWiki(wikiMock._id);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(wikiMock);
  });
});

describe('Wiki Page GET Methods', () => {
  test('makes a GET request to get one page of a wiki', async () => {
    const response = await wikiService.getPage({
      wikiId: wikiPageMock._id,
      pageId: wikiPageMock.pages[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toHaveProperty('_id');
    expect(response).toHaveProperty('pages');
    expect(response).toStrictEqual(wikiPageMock);
  });
});
