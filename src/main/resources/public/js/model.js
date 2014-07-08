function Page() {

}

function Wiki() {

	var wiki = this;
	
	this.collection(Page, {
		sync : function() {
			http().get('/wiki/list/' + wiki._id).done(function(wikiArray) {
				console.log("wikiArray");
				console.log(wikiArray);
				this.load(wikiArray[0].pages);
			}.bind(this));			
		}
	})
	
}

Wiki.prototype.getMainPage = function() {
	http().get('/wiki/' + this._id + '/page').done(function(wiki){
		this.page = new Page( wiki.pages[0] );
	}.bind(this));
}

Wiki.prototype.getWikiInfo = function() {
	http().get('/wiki/' + this._id + '/page').done(function(wiki){
		this.title = wiki.title;
		// TODO : créer une API pour récupérer uniquement les infos du wiki		
	}.bind(this));
}

Wiki.prototype.findPage = function(pageId, callback) {
	http().get('/wiki/' + this._id + '/page/' + pageId)
		.done(function(wiki){
			this.page = new Page( wiki.pages[0] );
			callback();
		}.bind(this));
}

Wiki.prototype.createPage = function(data, callback) {
	http().postJson('/wiki/' + this._id + '/page', data)
	.done(function(result){
		callback(result);
	});
}

Wiki.prototype.updatePage = function(data, pageId) {
	http().putJson('/wiki/' + this._id + '/page/' + pageId, data);
}

Wiki.prototype.deleteWiki = function() {
	http().delete('/wiki/' + this._id).done(function(){
		model.wikis.remove(this);
	}.bind(this));
}


model.build = function() {
	this.makeModels([ Wiki, Page ]);

	this.collection(Wiki, {
		sync : function() {
			http().get('/wiki/list').done(function(data) {
				this.load(data);
			}.bind(this));
		}

	})
};

