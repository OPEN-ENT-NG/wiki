var countPageUpdated = 0;

db.wiki.find({"pages.oldContent": { $exists: true } }).forEach((wiki) => {
  let changed = false;

  wiki.pages.forEach((page, index) => {
    if (page.oldContent && page.oldContent.length) {
      page.content = page.oldContent;
      delete page["jsonContent"];
      changed = true;
      countPageUpdated++;
    }
  });

  if (changed) {
    db.wiki.updateOne({ _id: wiki._id }, { $set: { pages: wiki.pages } });
  }
});

print("Nombre de pages modifiées : " + countPageUpdated);
