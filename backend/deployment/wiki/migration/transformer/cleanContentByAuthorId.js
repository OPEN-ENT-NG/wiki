const authorId = "0ab021fe-522c-493b-97bd-24e27e82602a";

function migrateByAuthorId(authorId) {
  try {
    const wikis = db.wiki.find({ "owner.userId": authorId });
    if (!wikis) {
      print("Wikis not found");
      return;
    }

    wikis.forEach((wiki) => {
      if (wiki.pages) {
        wiki.pages.forEach((page) => {
          page.content = page.oldContent;
          delete page["jsonContent"];
        });

        db.wiki.updateOne(
          {
            _id: wiki._id,
          },
          {
            $set: {
              pages: wiki.pages,
            },
          }
        );
      }
    });
    print("\nMigration finished");
  } catch (err) {
    print("Error :", err.message);
  }
}

migrateByAuthorId(authorId);
