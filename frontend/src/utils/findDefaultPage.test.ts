import {
  mockUserContrib,
  mockUserManager,
  mockUserRead,
  mockWiki,
  mockWikiWithHiddenIndexPage,
  mockWikiWithOnlyHiddenPages,
} from '~/mocks';
import { findDefaultPage } from './findDefaultPage';

describe('findDefaultPage', () => {
  it('should return the index page if the user is a manager', () => {
    const result = findDefaultPage(mockWiki, mockUserManager);
    expect(result?._id).toBe(mockWiki.index);
  });

  it('should return the index page if the user is a reader and index page is visible', () => {
    const result = findDefaultPage(mockWiki, mockUserRead);
    expect(result?._id).toBe(mockWiki.index);
  });

  it('should return the first visible page if the index page is not visible and user is not manager', () => {
    const firstVisiblePageId = '003';
    const result = findDefaultPage(
      mockWikiWithHiddenIndexPage,
      mockUserContrib,
    );
    expect(result?._id).toBe(firstVisiblePageId);
  });

  it('should return the index page if the user is a manager and the index page is not visible', () => {
    const result = findDefaultPage(
      mockWikiWithHiddenIndexPage,
      mockUserManager,
    );
    expect(result?._id).toBe(mockWikiWithHiddenIndexPage.index);
  });

  it('should return undefined if no visible page is found and user is not a manager', () => {
    const result = findDefaultPage(mockWikiWithOnlyHiddenPages, mockUserRead);
    expect(result).toBeUndefined();
  });
});
