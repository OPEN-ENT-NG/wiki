function Page() {

}

function Wiki() {

	var wiki = this;
	
	this.collection(Page, {
		sync : function(callback) {
			http().get('/wiki/' + wiki._id + '/listpages').done(function(returnedWiki) {
				this.load(returnedWiki.pages);
				if(typeof callback === 'function'){
					callback();
				}
			}.bind(this));			
		}
	})
	
}

Wiki.prototype.getWholeWiki = function(callback) {
	http().get('/wiki/' + this._id + '/whole')
		.done(function(wiki){
			this.updateData(wiki);
			if(typeof callback === 'function'){
				callback();
			}
		}.bind(this));
}

Wiki.prototype.getPage = function(pageId, callback, errorCallback) {
	http().get('/wiki/' + this._id + '/page/' + pageId)
		.done(function(wiki){
			this.page = new Page( wiki.pages[0] );
			this.title = wiki.title;
			this.owner = wiki.owner;
			callback(wiki);
		}.bind(this))
		.e404(function(e){
			errorCallback();
		});
}

Wiki.prototype.createPage = function(data, callback) {
	http().postJson('/wiki/' + this._id + '/page', data)
	.done(function(result){
		if(data.isIndex === true) {
			this.index = result._id;
		}
		callback(result);
	}.bind(this));
}

Wiki.prototype.updatePage = function(data, pageId, callback) {
	http().putJson('/wiki/' + this._id + '/page/' + pageId, data)
	.done(function(result){
		if(data.isIndex === true) {
			this.index = pageId;
		}
		else if (data.wasIndex === true) {
			delete this.index;
		}
		callback(result);
	}.bind(this));
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

