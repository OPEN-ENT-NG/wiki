db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|listRevisions": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|getRevisionById": true,
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|listRevisions": true,
      },
    ],
  }
);
