import { odeServices } from 'edifice-ts-client';
import {
  DuplicatePagePayload,
  Page,
  PageDto,
  PagePostPayload,
  PagePutPayload,
  PagesPutPayload,
  PickedPageId,
  PickedWiki,
  Wiki,
  WikiDto,
} from '~/models';
import { Revision } from '~/models/revision';
import { dtoToPage } from '~/utils/dtoToPage';
import { dtoToWikiPage } from '~/utils/dtoToWikiPages';

/**
 *
 * @param baseURL string
 * @returns get all HTTP methods
 */

const createWikiService = (baseURL: string) => ({
  async getWikisFromExplorer({
    pageSize = 10000,
    startIdx = 0,
  }: {
    pageSize?: number;
    startIdx?: number;
  }) {
    const response = await odeServices.resource('wiki').searchContext({
      application: 'wiki',
      filters: {},
      pagination: {
        startIdx,
        pageSize,
      },
      // if search is present it will search everywhere in explorer (not only in root)
      search: '',
      trashed: false,
      orders: {
        updatedAt: 'desc',
      },
      types: ['wiki'],
    });
    return response.resources;
  },
  /**
   *
   * @returns all wikis without pages
   */
  async getWikis() {
    const response = await odeServices
      .http()
      .get<PickedWiki[]>(`${baseURL}/list`);
    return response;
  },

  /**
   *
   * @param wikiId string
   * @returns get a wiki by id
   */
  async getWiki(wikiId: string) {
    const response = await odeServices.http().get<Wiki>(`${baseURL}/${wikiId}`);
    return response;
  },

  /**
   *
   * @param wikiId string
   * @returns get wiki pages by wiki id
   */
  async getWikiPages(wikiId: string, content: boolean): Promise<Page[]> {
    const response = await odeServices
      .http()
      .get<WikiDto>(`${baseURL}/${wikiId}/pages?content=${content}`);
    return dtoToWikiPage(response);
  },

  /**
   *
   * @returns all wikis with pages
   */
  async getAllWikisWithPages() {
    const response = await odeServices
      .http()
      .get<Wiki[]>(`${baseURL}/listallpages`);
    return response;
  },

  /**
   *
   * @param wikiId string
   * @param pageId string
   * @returns get a page of a wiki by id
   */
  async getPage({
    wikiId,
    pageId,
    originalformat,
  }: {
    wikiId: string;
    pageId: string;
    originalformat?: boolean;
  }) {
    const response = await odeServices
      .http()
      .get<PageDto>(
        `${baseURL}/${wikiId}/page/${pageId}?originalformat=${originalformat || false}`,
      );

    return dtoToPage(response);
  },

  /**
   *
   * @param wikiId
   * @param pageId
   * @returns all revisions of a page
   */
  async getRevisionsPage({
    wikiId,
    pageId,
  }: {
    wikiId: string;
    pageId: string;
  }) {
    const response = await odeServices
      .http()
      .get<Revision[]>(`${baseURL}/${wikiId}/page/${pageId}/revisions`);
    return response;
  },
  /**
   *
   * @param wikiId
   * @param pageId
   * @param revisionId
   * @returns on revision of a page by id
   */
  async getRevisionPage({
    wikiId,
    pageId,
    revisionId,
  }: {
    wikiId: string;
    pageId: string;
    revisionId: string;
  }) {
    const response = await odeServices
      .http()
      .get<Revision>(
        `${baseURL}/${wikiId}/page/${pageId}/revisions/${revisionId}`,
      );
    return response;
  },

  /**
   *
   * @param wikiId
   * @creates a new page
   */
  async createPage({
    wikiId,
    data,
  }: {
    wikiId: string;
    data: PagePostPayload;
  }) {
    const response = await odeServices
      .http()
      .post<Page>(`${baseURL}/${wikiId}/page`, data);

    return response;
  },

  /**
   *
   * @param wikiId
   * @updates a page
   */
  async updatePage({
    wikiId,
    pageId,
    data,
  }: {
    wikiId: string;
    pageId: string;
    data: PagePutPayload;
  }) {
    const response = await odeServices
      .http()
      .put<Page>(`${baseURL}/${wikiId}/page/${pageId}`, data);
    return response;
  },

  /**
   *
   * @param wikiId
   * @updates pages
   */
  async updatePages({
    wikiId,
    data,
  }: {
    wikiId: string;
    data: PagesPutPayload;
  }) {
    const response = await odeServices
      .http()
      .put<Page[]>(`${baseURL}/${wikiId}/pages`, data);
    return response;
  },

  /**
   * Delete a page of the current wiki.
   *
   * @param {Object} params - expected params to delete a page.
   * @param {string} params.wikiId - current wiki id.
   * @param {string} params.pageId - id of a page from the current wiki.
   * @returns {Promise<void>} a promise after deleting the page
   */
  async deletePage({ wikiId, pageId }: { wikiId: string; pageId: string }) {
    const response = await odeServices
      .http()
      .delete<Page>(`${baseURL}/${wikiId}/page/${pageId}`);

    return response;
  },

  async deletePages({ wikiId, ids }: { wikiId: string; ids: string[] }) {
    const response = await odeServices
      .http()
      .deleteJson<Page[]>(`${baseURL}/${wikiId}/pages`, {
        ids,
      });
    return response;
  },

  /**
   * Create a new comment
   *
   * @param {Object} params - expected params to create a new comment.
   * @param {string} params.wikiId - current wiki id.
   * @param {string} params.pageId - id of a page from the current wiki.
   * @param {string} params.comment - comment text.
   * @returns {Promise<void>} a promise after creating the new comment.
   */
  async createComment({
    wikiId,
    pageId,
    comment,
  }: {
    wikiId: string;
    pageId: string;
    comment: string;
  }): Promise<Comment> {
    const response = await odeServices
      .http()
      .postJson<Comment>(`${baseURL}/${wikiId}/page/${pageId}/comment`, {
        comment,
      });

    return response;
  },

  /**
   * Update a comment
   *
   * @param {Object} params - expected params to update a comment.
   * @param {string} params.wikiId - current wiki id.
   * @param {string} params.pageId - id of a page from the current wiki.
   * @param {string} params.comment - new comment text.
   * @returns {Promise<void>} a promise after updating the comment.
   */
  async updateComment({
    wikiId,
    pageId,
    commentId,
    comment,
  }: {
    wikiId: string;
    pageId: string;
    commentId: string;
    comment: string;
  }) {
    const response = await odeServices
      .http()
      .putJson<Comment>(
        `${baseURL}/${wikiId}/page/${pageId}/comment/${commentId}`,
        { comment },
      );

    return response;
  },
  /**
   * Delete a comment
   *
   * @param {Object} params - expected params to delete a comment.
   * @param {string} params.wikiId - current wiki id.
   * @param {string} params.pageId - id of a page from the current wiki.
   * @param {string} params.commentId - id of the comment to be deleted.
   * @returns {Promise<void>} a promise after deleting the comment.
   */
  async deleteComment({
    wikiId,
    pageId,
    commentId,
  }: {
    wikiId: string;
    pageId: string;
    commentId: string;
  }) {
    const response = await odeServices
      .http()
      .delete<Comment>(
        `${baseURL}/${wikiId}/page/${pageId}/comment/${commentId}`,
      );
    return response;
  },
  /**
   * Duplicate a page
   *
   * @param {Object} params - expected params to duplicate a page.
   * @param {string} params.sourceWikiId - source wiki id.
   * @param {string} params.destinationWikiId - destination wiki id.
   * @param {DuplicatePagePayload} params.data - data for the new page.
   * @returns {Promise<Page>} a promise that resolves to the newly created page.
   */
  async duplicatePage({
    destinationWikiId,
    data,
  }: {
    destinationWikiId: string;
    data: DuplicatePagePayload;
  }) {
    const response = await odeServices
      .http()
      .post<PickedPageId>(`${baseURL}/${destinationWikiId}/page`, data);
    return response;
  },
});

export const baseURL = '/wiki';
export const wikiService = createWikiService(baseURL);
