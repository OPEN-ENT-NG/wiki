db.wiki.find({"pages.content" : { "$exists" : true}}, { "_id" : 1, "pages" : 1 }).forEach(function(wiki) {
    var p = wiki.pages;
    for (var i = 0; i < p.length; i++) {
        var text =  p[i]["content"].replace(/<[^>]*>/g, '');
        p[i]["contentPlain"] = text;
    }
    db.wiki.update({"_id" : wiki._id}, { $set : { "pages" : p}});
});
db.wiki.createIndex({ "title": "text", "pages.contentPlain": "text", "pages.title": "text"});