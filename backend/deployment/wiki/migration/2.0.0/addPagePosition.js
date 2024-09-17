var countPageUpdated = 0;

db.wiki.find({}).forEach((wiki) => {
  wiki.pages.forEach((page, index) => {
    page.position = index;
    countPageUpdated++;
  });
  db.wiki.updateOne(
    { _id: wiki._id },
    { $set: { pages: wiki.pages } }
  );
});

print("Nombre de pages modifiées : " + countPageUpdated);