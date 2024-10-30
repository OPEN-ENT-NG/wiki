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

db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|getWholeWiki": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|getWiki": true,
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

db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|updatePage": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|updatePageList": true,
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|updatePage": true,
      },
    ],
  }
);
db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|deletePage": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|deletePageList": true,
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|deletePage": true,
      },
    ],
  }
);
