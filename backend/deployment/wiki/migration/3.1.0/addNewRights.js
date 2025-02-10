db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|getWiki": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|duplicatePage": true,
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|getWiki": true,
      },
    ],
  }
);