db.wiki.find({"shared.net-atos-entng-wiki-controllers-WikiController|createPage" : true}, {"_id":1, "shared":1}).forEach(function(wiki) {
  var s = wiki.shared;
  for (var i = 0; i < s.length; i++) {
    if (s[i]["net-atos-entng-wiki-controllers-WikiController|createPage"] === true) {
      s[i]["net-atos-entng-wiki-controllers-WikiController|listRevisions"] = true;
    }
  }
  db.wiki.update({"_id" : wiki._id}, { $set : { "shared" : s}});
});
