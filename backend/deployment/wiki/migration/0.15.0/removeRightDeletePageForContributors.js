db.wiki.find({$and : [{"shared.net-atos-entng-wiki-controllers-WikiController|deletePage" : true}]}, {"_id":1, "shared":1}).forEach(function(wiki) {
    var sharedArray = wiki.shared;
    for (var i = 0; i < sharedArray.length; i++) {
        var countKeys = Object.keys(sharedArray[i]).length;
        // On est dans le cas d'un partage de type contributeur
        if(countKeys === 8 || countKeys === 9){
            delete sharedArray[i]["net-atos-entng-wiki-controllers-WikiController|deletePage"];
            db.wiki.update({"_id" : wiki._id}, {$set : { "shared" : sharedArray} });
        }
    }
});