import { Wiki } from '~/models';

const createWikiService = (baseURL: string) => ({
  async getAll() {
    const response = await fetch(`${baseURL}/wiki`);
    return await response.json();
  },

  async get(id: string) {
    const response = await fetch(`${baseURL}/wiki/${id}`);
    return await response.json();
  },

  async create(data: Wiki[]) {
    const response = await fetch(`${baseURL}/wiki`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async update(id: string, data: Wiki[]) {
    const response = await fetch(`${baseURL}/wiki/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async delete(id: string) {
    const response = await fetch(`${baseURL}/wiki/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  },
});

export const wikiService = createWikiService('/wiki');
