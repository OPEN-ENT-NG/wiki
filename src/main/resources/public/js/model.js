function Page() {

}

function Wiki() {

	var wiki = this;
	
	this.collection(Page, {
		sync : function(callback) {
			http().get('/wiki/list/' + wiki._id).done(function(wikiArray) {
				this.load(wikiArray[0].pages);
				wiki.title = wikiArray[0].title;
				callback();
			}.bind(this));			
		}
	})
	
}

Wiki.prototype.findPage = function(pageId, callback) {
	http().get('/wiki/' + this._id + '/page/' + pageId)
		.done(function(wiki){
			this.page = new Page( wiki.pages[0] );
			this.title = wiki.title;
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

Wiki.prototype.renameWiki = function(data, callback) {
	http().putJson('/wiki/' + this._id, data).done(function(){
		callback();
	});
}

Wiki.prototype.deleteWiki = function() {
	http().delete('/wiki/' + this._id).done(function(){
		model.wikis.remove(this);
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
	this.makeModels([ Wiki, Page ]);

	this.collection(Wiki, {
		sync : function() {
			http().get('/wiki/list').done(function(data) {
				this.load(data);
			}.bind(this));
		}

	})
};

