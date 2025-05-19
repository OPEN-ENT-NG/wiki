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

db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|updatePageList": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|deletePageList": true,
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|updatePageList": true,
      },
    ],
  }
);

db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|comment": true,
  },
  {
    $set: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|updateComment": true,
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|comment": true,
      },
    ],
  }
);