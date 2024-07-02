export const workflows = {
  view: 'net.atos.entng.wiki.controllers.WikiController|view',
  list: 'net.atos.entng.wiki.controllers.WikiController|list',
  create: 'net.atos.entng.wiki.controllers.WikiController|create',
  publish: 'net.atos.entng.wiki.controllers.WikiController|publish',
  print: 'net.atos.entng.wiki.controllers.WikiController|print',
};

export const rights = {
  read: {
    right: 'net-atos-entng-wiki-controllers-WikiController|retrieve',
  },
  contrib: {
    right: 'net-atos-entng-wiki-controllers-WikiController|update',
  },
  manage: {
    right: 'net-atos-entng-wiki-controllers-WikiController|delete',
  },
};
