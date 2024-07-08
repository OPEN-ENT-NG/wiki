import { odeServices } from 'edifice-ts-client';
import {
  Page,
  PagePostPayload,
  PagePutPayload,
  PickedWiki,
  Wiki,
} from '~/models';

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
  async getAllWikis() {
    const response = await odeServices
      .http()
      .get<PickedWiki[]>(`${baseURL}/list`);
    return response;
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
   * @returns get a wiki by id
   */
  async getWiki(wikiId: string) {
    const response = await odeServices
      .http()
      .get<Wiki>(`${baseURL}/${wikiId}/listpages`);
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
      .get<Page>(`${baseURL}/${wikiId}/page/${pageId}`);
    return response;
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
      .get<Page>(`${baseURL}/revisions/${wikiId}/${pageId}`);
    return response;
  },

  /**
   *
   * @param wikiId
   * @returns a new page
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
   * @returns the updated page
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
   * @returns
   */
  async deletePage({ wikiId, pageId }: { wikiId: string; pageId: string }) {
    const response = await odeServices
      .http()
      .delete<Page>(`${baseURL}/${wikiId}/page/${pageId}`);
    return response;
  },

  /**
   *
   * NOT IMPLEMENTED YET
   */
  async createComment({ wikiId, pageId }: { wikiId: string; pageId: string }) {
    const response = await odeServices
      .http()
      .post<Comment>(`${baseURL}/${wikiId}/page/${pageId}/comment`);
    return response;
  },

  /**
   *
   * NOT IMPLEMENTED YET
   */
  async updateComment({
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
      .post<Comment>(
        `${baseURL}/${wikiId}/page/${pageId}/comment/${commentId}`
      );
    return response;
  },
  /**
   *
   * NOT IMPLEMENTED YET
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
