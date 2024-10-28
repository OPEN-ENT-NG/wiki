var countPageRollbacked = 0;

db.wiki.find({}).forEach((wiki) => {
  wiki.pages.forEach((page) => {
    delete page.isVisible;
    countPageRollbacked++;
  });
  db.wiki.updateOne({ _id: wiki._id }, { $set: { pages: wiki.pages } });
});

print("Nombre de pages rollback : " + countPageRollbacked);
