import { odeServices } from 'edifice-ts-client';
import {
  Page,
  PageDto,
  PagePostPayload,
  PagePutPayload,
  PickedWiki,
  Wiki,
} from '~/models';
import { Revision } from '~/models/revision';
import { dtoToPage } from '~/utils/dtoToPage';

/**
 *
 * @param baseURL string
 * @returns get all HTTP methods
 */

const createWikiService = (baseURL: string) => ({
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
  async getWikiPages(wikiId: string) {
    const response = await odeServices
      .http()
      .get<Page[]>(`${baseURL}/${wikiId}/pages`);
    return response;
  },

  /**
   *
   * @param wikiId string
   * @param pageId string
   * @returns get a page of a wiki by id
   */
  async getPage({ wikiId, pageId }: { wikiId: string; pageId: string }) {
    const response = await odeServices
      .http()
      .get<PageDto>(`${baseURL}/${wikiId}/page/${pageId}`);

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
      .get<Revision[]>(`${baseURL}/revisions/${wikiId}/${pageId}`);
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
  }) {
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
        { comment }
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
        `${baseURL}/${wikiId}/page/${pageId}/comment/${commentId}`
      );
    return response;
  },
});

export const baseURL = '/wiki';
export const wikiService = createWikiService(baseURL);
