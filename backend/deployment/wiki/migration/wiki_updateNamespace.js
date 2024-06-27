db.wiki.find({"shared.0" : { "$exists" : true }}, {"_id":1, "shared":1}).forEach(function(wiki) {
var string = JSON.stringify(wiki);
var obj = JSON.parse(string.replace(/fr\-wseduc/g, 'net-atos-entng'));
db.wiki.update({"_id" : wiki._id}, { $set : { "shared" : obj.shared}});
});