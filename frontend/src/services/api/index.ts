import { odeServices } from 'edifice-ts-client';
import { Page, Wiki } from '~/models';

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
  async getAllWiki() {
    const response = await odeServices.http().get<Wiki[]>(`${baseURL}/list`);
    return response;
  },

  /**
   *
   * @returns all wikis with pages
   */
  async getAllWikiWithPages() {
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
  async getPage(wikiId: string, pageId: string) {
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
  async getRevisionPage(wikiId: string, pageId: string) {
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
  async createPage(wikiId: string) {
    const response = await odeServices
      .http()
      .post<Page>(`${baseURL}/${wikiId}/page`);
    return response;
  },

  /**
   *
   * @param wikiId
   * @returns the updated page
   */
  async updatePage(wikiId: string, pageId: string) {
    const response = await odeServices
      .http()
      .put<Page>(`${baseURL}/${wikiId}/page/${pageId}`);
    return response;
  },

  /**
   *
   * @param wikiId
   * @returns ???
   */
  async deletePage(wikiId: string, pageId: string) {
    const response = await odeServices
      .http()
      .delete<Page>(`${baseURL}/${wikiId}/page/${pageId}`);
    return response;
  },

  async createComment(wikiId: string, pageId: string) {
    const response = await odeServices
      .http()
      .post<Comment>(`${baseURL}/${wikiId}/page/${pageId}/comment`);
    return response;
  },

  async updateComment(wikiId: string, pageId: string, commentId: string) {
    const response = await odeServices
      .http()
      .post<Comment>(
        `${baseURL}/${wikiId}/page/${pageId}/comment/${commentId}`
      );
    return response;
  },

  async deleteComment(wikiId: string, pageId: string, commentId: string) {
    const response = await odeServices
      .http()
      .delete<Comment>(
        `${baseURL}/${wikiId}/page/${pageId}/comment/${commentId}`
      );
    return response;
  },
});

export const wikiService = createWikiService('/wiki');
