db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|getWholeWiki": true,
  },
  {
    $unset: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|getWholeWiki": "",
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|getWholeWiki": true,
      },
    ],
  }
);