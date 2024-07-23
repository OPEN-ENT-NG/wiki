import { ID, odeServices } from 'edifice-ts-client';

export function getAvatarURL(userId: ID): string {
  return odeServices.directory().getAvatarUrl(userId, 'user');
}

export function getUserbookURL(userId: ID): string {
  return odeServices.directory().getDirectoryUrl(userId, 'user');
}
