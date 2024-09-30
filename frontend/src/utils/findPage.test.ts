import { test } from 'vitest';
import { mockPage, mockWiki } from '~/mocks';
import { findPage } from './findPage';

describe('findPage utils tests', () => {
  test('Returns the page with given pageId from given wiki', () => {
    const page = findPage(mockWiki, mockPage.pages[0]._id);

    expect(page).toBeDefined();
    expect(page?._id).toBe(mockPage.pages[0]._id);
  });

  test('Retrieving a non existing page returns undefined', () => {
    const page = findPage(mockWiki, 'NON_EXISTING_PAGE_ID');

    expect(page).toBeUndefined();
  });
});