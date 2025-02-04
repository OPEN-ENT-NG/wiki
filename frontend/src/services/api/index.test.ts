import {
  mockWikiWithOnePage,
  mockRevision,
  mockWiki,
  mockWikiPagesWithoutContent,
  mockWikis,
  mockWikisAsResources,
  mockWikisWithPages,
  mockPage,
} from '~/mocks';
import { wikiService } from '..';

describe('Wiki GET Methods', () => {
  test('makes a GET request to get all wikis without pages', async () => {
    const response = await wikiService.getWikis();

    expect(response).toBeDefined();
    expect(response).toHaveLength(2);
    expect(response).toStrictEqual(mockWikis);
  });

  test('makes a GET request to get all wikis with pages', async () => {
    const response = await wikiService.getAllWikisWithPages();

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockWikisWithPages);
  });

  test('makes a GET request to get one wiki with pages', async () => {
    const response = await wikiService.getWiki(mockWiki._id);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockWiki);
  });

  test('makes a GET request to get wikis from explorer', async () => {
    const response = await wikiService.getWikisFromExplorer({});

    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
    expect(response).toHaveLength(mockWikisAsResources.length);
    expect(response).toEqual(expect.arrayContaining(mockWikisAsResources));
  });
});

describe('Wiki Page GET Methods', () => {
  test('makes a GET request to get one page of a wiki', async () => {
    const response = await wikiService.getPage({
      wikiId: mockWikiWithOnePage._id,
      pageId: mockWikiWithOnePage.pages[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toHaveProperty('_id');
    expect(response).toEqual(mockPage);
  });

  test('makes a GET request to get pages of a wiki with content', async () => {
    const response = await wikiService.getWikiPages(mockWiki._id, true);

    expect(response).toBeDefined();
    expect(response).toEqual(mockWiki.pages);
  });

  test('makes a GET request to get pages of a wiki without content', async () => {
    const response = await wikiService.getWikiPages(
      mockWikiPagesWithoutContent._id,
      false,
    );

    expect(response).toBeDefined();
    expect(response).toEqual(mockWikiPagesWithoutContent.pages);
  });

  test('makes a GET request to get revisions of a page', async () => {
    const response = await wikiService.getRevisionsPage({
      wikiId: mockWikiWithOnePage._id,
      pageId: mockWikiWithOnePage.pages[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockRevision);
  });

  test('makes a GET request to get one revision of a page', async () => {
    const response = await wikiService.getRevisionPage({
      wikiId: mockWikiWithOnePage._id,
      pageId: mockWikiWithOnePage.pages[0]._id,
      revisionId: mockRevision[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockRevision[0]);
  });
});

describe('Wiki Page Mutation Methods', () => {
  test('makes a POST request to create a new page of a wiki', async () => {
    const response = await wikiService.createPage({
      wikiId: mockWikiWithOnePage._id,
      data: {
        title: "page d'accueil",
        content: 'test',
      },
    });

    expect(response).toHaveProperty('title');
    expect(response).toHaveProperty('content');
  });

  test('makes a PUT request to update a page of a wiki', async () => {
    const response = await wikiService.updatePage({
      wikiId: mockWikiWithOnePage._id,
      pageId: mockWikiWithOnePage.pages[0]._id,
      data: {
        title: "page d'accueil",
        content: 'test',
      },
    });

    expect(response).toHaveProperty('number', 1);
  });

  test('makes a DELETE request to delete a page of a wiki', async () => {
    const response = await wikiService.deletePage({
      wikiId: mockWikiWithOnePage._id,
      pageId: mockWikiWithOnePage.pages[0]._id,
    });

    expect(response).toHaveProperty('number', 0);
  });
});
