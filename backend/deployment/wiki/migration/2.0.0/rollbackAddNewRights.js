db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|getRevisionById": true,
  },
  {
    $unset: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|getRevisionById":
        "",
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|getRevisionById": true,
      },
    ],
  }
);

db.wiki.updateMany(
  {
    "shared.net-atos-entng-wiki-controllers-WikiController|updatePageList": true,
  },
  {
    $unset: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|updatePageList":
        "",
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
    "shared.net-atos-entng-wiki-controllers-WikiController|deletePageList": true,
  },
  {
    $unset: {
      "shared.$[elem].net-atos-entng-wiki-controllers-WikiController|deletePageList":
        "",
    },
  },
  {
    arrayFilters: [
      {
        "elem.net-atos-entng-wiki-controllers-WikiController|deletePageList": true,
      },
    ],
  }
);
