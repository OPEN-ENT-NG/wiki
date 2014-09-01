function Page() {

}

function Wiki() {

	var wiki = this;
	
	this.collection(Page, {
		sync : function(callback) {
			http().get('/wiki/' + wiki._id + '/listpages').done(function(returnedWiki) {
				this.load(returnedWiki.pages);
				callback();
			}.bind(this));			
		}
	})
	
}

Wiki.prototype.getPage = function(pageId, callback) {
	http().get('/wiki/' + this._id + '/page/' + pageId)
		.done(function(wiki){
			this.page = new Page( wiki.pages[0] );
			this.title = wiki.title;
			this.owner = wiki.owner;
			callback(wiki);
		}.bind(this));
}

Wiki.prototype.createPage = function(data, callback) {
	http().postJson('/wiki/' + this._id + '/page', data)
	.done(function(result){
		callback(result);
	});
}

Wiki.prototype.updatePage = function(data, pageId, callback) {
	http().putJson('/wiki/' + this._id + '/page/' + pageId, data).done(function(result){
		callback(result);
	});
}

Wiki.prototype.deletePage = function(wikiId, pageId, callback) {
	http().delete('/wiki/' + wikiId + '/page/' + pageId).done(function(result){
		callback(result);
	});
}

Wiki.prototype.createWiki = function(data, callback) {
	http().postJson('/wiki', data).done(function(result){
		callback(result);
	});
}

Wiki.prototype.updateWiki = function(data, callback) {
	http().putJson('/wiki/' + this._id, data).done(function(){
		callback();
	});
}

Wiki.prototype.deleteWiki = function(callback) {
	http().delete('/wiki/' + this._id).done(function(){
		model.wikis.remove(this);
		callback();
	}.bind(this));
}

Wiki.prototype.listAllPages = function(callback) {
	http().get('/wiki/listallpages').done(
			function(wikis) {
				
				var pagesArray = _.map(
						wikis, 
						function(wiki) {
							var pages = _.map(wiki.pages, function(page) {
								return {
									title : page.title + ' [' + wiki.title + ']',
									_id : page._id,
									wiki_id : wiki._id,
									toString : function() {
										return this.title;
									}
								}
							});
							
							return pages;
						}
					);

				pagesArray = _.flatten(pagesArray);
				callback(pagesArray);
			});
}


model.build = function() {
	model.me.workflow.load(['wiki']);
	this.makeModels([ Wiki, Page ]);

	this.collection(Wiki, {
		sync : function() {
			http().get('/wiki/list').done(function(wikilist) {
				this.load(wikilist);
			}.bind(this));
		},
		behaviours: 'wiki'

	})
};

