import { test } from 'vitest';
import {
  mockPage,
  mockRevision,
  mockWiki,
  mockWikiPages,
  mockWikis,
} from '~/mocks';
import { wikiService } from '..';

import '~/mocks/setup.msw';

describe('Wiki GET Methods', () => {
  test('makes a GET request to get all wikis without pages', async () => {
    const response = await wikiService.getWikis();

    expect(response).toBeDefined();
    expect(response).toHaveLength(2);
    expect(response).toStrictEqual(mockWikis);
  });

  test('makes a GET request to get pages from a wiki', async () => {
    const response = await wikiService.getWikiPages(mockWiki._id, false);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockWikiPages.pages);
  });

  test('makes a GET request to get one wiki with pages', async () => {
    const response = await wikiService.getWiki(mockWiki._id);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockWiki);
  });
});

describe('Wiki Page GET Methods', () => {
  test('makes a GET request to get one page of a wiki', async () => {
    const response = await wikiService.getPage({
      wikiId: mockPage._id,
      pageId: mockPage.pages[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toHaveProperty('_id');
    expect(response).toHaveProperty('pages');
    expect(response).toEqual(mockPage);
  });

  test('makes a GET request to get revisions of a page', async () => {
    const response = await wikiService.getRevisionsPage({
      wikiId: mockPage._id,
      pageId: mockPage.pages[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockRevision);
  });

  test('makes a GET request to get one revision of a page', async () => {
    const response = await wikiService.getRevisionPage({
      wikiId: mockPage._id,
      pageId: mockPage.pages[0]._id,
      revisionId: mockRevision[0]._id,
    });

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockRevision[0]);
  });
});

describe('Wiki Page Mutation Methods', () => {
  test('makes a POST request to create a new page of a wiki', async () => {
    const response = await wikiService.createPage({
      wikiId: mockPage._id,
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
      wikiId: mockPage._id,
      pageId: mockPage.pages[0]._id,
      data: {
        title: "page d'accueil",
        content: 'test',
      },
    });

    expect(response).toHaveProperty('number', 1);
  });

  test('makes a DELETE request to delete a page of a wiki', async () => {
    const response = await wikiService.deletePage({
      wikiId: mockPage._id,
      pageId: mockPage.pages[0]._id,
    });

    expect(response).toHaveProperty('number', 0);
  });
});
