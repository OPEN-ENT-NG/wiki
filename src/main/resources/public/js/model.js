function Version(){}

Version.prototype.toJSON = function(){
	return {
		content: this.content,
		title: this.title
	};
};

function findSequence(x,y){
	var s, i, j,
		lcs = [], row = [], c = [],
		left, diag, latch;

	if(x.length < y.length){
		s = x;
		x = y;
		y = s;
	}

	for(j = 0; j < y.length; row[j++] = 0);
	for(i = 0; i < x.length; i++){
		c[i] = row = row.slice();
		for(diag = 0, j = 0; j < y.length; j++, diag = latch){
			latch = row[j];
			if(x[i].innerText === y[j].innerText){
				row[j] = diag + 1;
			}
			else{
				left = row[j-1] || 0;
				if(left>row[j]){
					row[j] = left;
				}
			}
		}
	}
	i--; j--;

	while(i>-1&&j>-1){
		switch(c[i][j]){
			default: j--;
				lcs.unshift(x[i]);
			case (i&&c[i-1][j]): i--;
				continue;
			case (j&&c[i][j-1]): j--;
		}
	}
	return lcs;
}

function findTextSequence(x,y){
	var s,i,j,
		lcs = [], row = [], c = [],
		left, diag, latch;

	if(x.length < y.length){
		s = x;
		x = y;
		y = s;
	}

	for(j = 0; j < y.length; row[j++] = 0);
	for(i = 0; i < x.length; i++){
		c[i] = row = row.slice();
		for(diag = 0, j = 0; j < y.length; j++, diag = latch){
			latch = row[j];
			if(x[i] === y[j]){
				row[j] = diag+1;
			}
			else{
				left = row[j-1]||0;
				if(left>row[j]){
					row[j] = left;
				}
			}
		}
	}
	i--; j--;
	while(i > -1 && j > -1){
		switch(c[i][j]){
			default: j--;
				lcs.unshift(x[i]);
			case (i&&c[i-1][j]): i--;
				continue;
			case (j&&c[i][j-1]): j--;
		}
	}
	return lcs;
}

function similar(a, b){
	var textSequence = findTextSequence(a.innerText.split(' '), b.innerText.split(' '));
	return textSequence.length > a.innerText.split(' ').length / 4 || textSequence.length > b.innerText.split(' ').length / 4;
}

function compare(a, b){
	var aIndex = 0;
	var bIndex = 0;
	var bVariations = {};
	var sequence = findSequence(a, b);
	sequence.forEach(function(child, index){
		bVariations[index] = [];
		while(bIndex < b.length && child.innerText !== b[bIndex].innerText){
			bVariations[index].push(b[bIndex]);
			bIndex ++;
		}
		bIndex ++;
	});
	bVariations[sequence.length-1] = [];
	for(var i = bIndex; i < b.length; i++){
		bVariations[sequence.length-1].push(b[i]);
	}

	sequence.forEach(function(child, index){
		var aVariations = 0;
		while(aIndex < a.length && child.innerText !== a[aIndex].innerText){
			var noEquivalent = true;
			for(var n = 0; n < bVariations[index].length; n++){
				if(similar(a[aIndex], bVariations[index][n])){
					$(a[aIndex]).addClass('diff');
					noEquivalent = false;
				}
			}

			if(noEquivalent){
				$(a[aIndex]).addClass('added');
			}
			aIndex ++;
			aVariations ++;
		}
		if(aVariations === 1 && bVariations[index].length === 1){
			$(a[aIndex]).removeClass('added').addClass('diff');
		}
		aIndex ++;
	});

	for(var j = aIndex; j < a.length; j++){
		var noEquivalent = true;
		for(var n = 0; n < bVariations[sequence.length - 1].length; n++){
			if(similar(a[j], bVariations[sequence.length - 1][n])){
				$(a[j]).addClass('diff');
				noEquivalent = false;
			}
		}

		if(noEquivalent){
			$(a[j]).addClass('added');
		}
	}
	if(j === aIndex + 1 && bVariations[sequence.length - 1].length === 1){
		$(a[j]).removeClass('added').addClass('diff');
	}
}

Version.prototype.comparison = function(left, right){
	var leftRoot = $(left.content);
	var rightRoot = $(right.content);
	//fix for empty div content
	while(leftRoot.length === 1 && leftRoot.children().length > 0 && leftRoot[0].nodeName === 'DIV'){
		leftRoot = leftRoot.children();
	}
	while(rightRoot.length === 1 && rightRoot.children().length > 0 && rightRoot[0].nodeName === 'DIV'){
		rightRoot = rightRoot.children();
	}

	compare(leftRoot, rightRoot);
	compare(rightRoot, leftRoot);

	var added = 0;
	leftRoot.each(function(index, item){
		if($(item).hasClass('added')){
			rightRoot.splice(index + added, 0, $(item.outerHTML).removeClass('added').addClass('removed')[0]);
		}
		if($(rightRoot[index]).hasClass('added')){
			added++;
		}
	});

	rightRoot.each(function(index, item){
		if($(item).hasClass('added')){
			leftRoot.splice(index, 0, $(item.outerHTML).removeClass('added').addClass('removed')[0]);
		}
	});

	return {
		left: _.map(leftRoot, function(el){ return el.outerHTML }).join(''),
		right: _.map(rightRoot, function(el){ return el.outerHTML }).join('')
	}
};

Version.prototype.rightComparison = function(left){
	return this.content;
};

function Page() {
	var page = this;
	this.collection(Version, {
		sync: '/wiki/revisions/' + page.wiki_id + '/' + page._id
	});
}

Page.prototype.restoreVersion = function(version){
	this.content = version.content;
	this.title = version.title;
	this.save();
};

Page.prototype.comment = function(commentText, callback) {
	http().postJson('/wiki/' + this.wiki_id + '/page/' + this._id, { comment: commentText })
	.done(function(response){
		if(typeof callback === 'function'){
			callback();
		}
	}.bind(this));
};

Page.prototype.deleteComment = function(commentId, commentIndex, callback) {
	http().delete('/wiki/' + this.wiki_id + '/page/' + this._id + '/comment/' + commentId)
	.done(function(){
		this.comments.splice(commentIndex, 1);
		if(typeof callback === 'function'){
			callback();
		}
	}.bind(this));
};

Page.prototype.save = function(callback){
	http().putJson('/wiki/' + this.wiki_id + '/page/' + this._id, this)
		.done(function(result){
			if(this.isIndex === true) {
				this.index = this._id;
			}
			else if (this.wasIndex === true) {
				delete this.index;
			}
			callback(result);
		}.bind(this));
};

Page.prototype.toJSON = function(){
	return {
		title: this.title,
		content: this.content,
		isIndex: this.isIndex,
		wasIndex: this.wasIndex
	};
};

function Wiki() {

	var wiki = this;
	
	this.collection(Page, {
		sync : function(callback) {
			http().get('/wiki/' + wiki._id + '/listpages').done(function(returnedWiki) {
				returnedWiki.pages = _.map(returnedWiki.pages, function(page){
					page.wiki_id = wiki._id;
					return page;
				});
				this.load(returnedWiki.pages);
				if(typeof callback === 'function'){
					callback();
				}
			}.bind(this));			
		}
	});
	
}

Wiki.prototype.getWholeWiki = function(callback) {
	http().get('/wiki/' + this._id + '/whole')
		.done(function(wiki){
			this.updateData(wiki);
			if(typeof callback === 'function'){
				callback();
			}
		}.bind(this));
};

Wiki.prototype.getPage = function(pageId, callback, errorCallback) {
	http().get('/wiki/' + this._id + '/page/' + pageId)
		.done(function(wiki){
			wiki.pages[0].wiki_id = this._id;
			this.page = new Page( wiki.pages[0] );
			this.title = wiki.title;
			this.owner = wiki.owner;
			callback(wiki);
		}.bind(this))
		.e404(function(){
			errorCallback();
		});
};

Wiki.prototype.createPage = function(data, callback) {
	http().postJson('/wiki/' + this._id + '/page', data)
	.done(function(result){
		if(data.isIndex === true) {
			this.index = result._id;
		}
		callback(result);
	}.bind(this));
};

Wiki.prototype.deletePage = function(wikiId, pageId, callback) {
	http().delete('/wiki/' + wikiId + '/page/' + pageId).done(function(result){
		callback(result);
	});
};

Wiki.prototype.createWiki = function(data, callback) {
	http().postJson('/wiki', data).done(function(result){
		callback(result);
	});
};

Wiki.prototype.updateWiki = function(data, callback) {
	http().putJson('/wiki/' + this._id, data).done(function(){
		callback();
	});
};

Wiki.prototype.deleteWiki = function(callback) {
	http().delete('/wiki/' + this._id).done(function(){
		model.wikis.remove(this);
		callback();
	}.bind(this));
};

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
								};
							});
							
							return pages;
						}
					);

				pagesArray = _.flatten(pagesArray);
				callback(pagesArray);
			});
};


model.build = function() {
	model.me.workflow.load(['wiki']);
	this.makeModels([ Wiki, Page, Version ]);

	this.collection(Wiki, {
		sync : '/wiki/list',
		behaviours: 'wiki'
	});
};

