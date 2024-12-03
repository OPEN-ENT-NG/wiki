const wikiId = "bd87f259-f464-43ed-87ca-cd23516b7085";
const pageId = "66f3f7da7815b93671e281df";

function migrateSpecificPage(wikiId, pageId) {
  try {
    const wiki = db.wiki.findOne({ _id: wikiId });
    if (!wiki) {
      print("Wiki not found");
      return;
    }

    const pageIndex = wiki.pages.findIndex((p) => p._id.toString() === pageId);
    if (pageIndex === -1) {
      print("Page not found");
      return;
    }
    var page = wiki.pages[pageIndex];
    print("Before update :");
    printjson(page);

    page.content = page.oldContent;
    delete page["jsonContent"];

    db.wiki.updateOne(
      {
        _id: wikiId,
        "pages._id": pageId,
      },
      {
        $set: {
          "pages.$": page,
        },
      }
    );

    print("\nAfter update :");
    printjson(page);
    print("\nMigration finished");
  } catch (err) {
    print("Error :", err.message);
  }
}

migrateSpecificPage(wikiId, pageId);
