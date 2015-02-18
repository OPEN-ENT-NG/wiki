// 1) Model - it is declared in behaviours.js, so that it can be shared by wiki application and wiki sniplet

var wikiNamespace = {
	Version: function(){
	},
	Page: function() {
		var page = this;
		this.collection(Behaviours.applicationsBehaviours.wiki.namespace.Version, {
			sync: '/wiki/revisions/' + page.wiki_id + '/' + page._id
		});
	},
	Wiki: function() {
		var wiki = this;
		
		this.collection(Behaviours.applicationsBehaviours.wiki.namespace.Page, {
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
};

// Utility functions shared by wiki sniplet and wiki application
wikiNamespace.getDateAndTime = function(dateObject){
	return moment(dateObject.$date).lang('fr').format('LLLL');
};

wikiNamespace.getRelativeTimeFromDate = function(dateObject){
	return moment(dateObject.$date).lang('fr').fromNow();
};

wikiNamespace.titleIsEmpty = function(title) {
	return (!title || title.trim().length === 0);
};

wikiNamespace.pageTitleExists = function(pTitle, pWiki, pPageId) {
	if(!pPageId) {
		// when creating a page
		return _.find(pWiki.pages.all, function(page){
			return page.title.trim() === pTitle.trim();
		});
	}
	else {
		// when updating a page
		return _.find(pWiki.pages.all, function(page){
			return page.title.trim() === pTitle.trim() && 
					page._id !== pPageId;
		});
	}
};


// Versions (i.e. revisions of a wiki page)
wikiNamespace.Version.prototype.toJSON = function(){
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

wikiNamespace.Version.prototype.comparison = function(left, right){
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
		left: _.map(leftRoot, function(el){ return el.outerHTML; }).join(''),
		right: _.map(rightRoot, function(el){ return el.outerHTML; }).join('')
	};
};

wikiNamespace.Version.prototype.rightComparison = function(left){
	return this.content;
};

// Wiki pages
wikiNamespace.Page.prototype.restoreVersion = function(version){
	this.content = version.content;
	this.title = version.title;
	this.save();
};

wikiNamespace.Page.prototype.comment = function(commentText, callback) {
	http().postJson('/wiki/' + this.wiki_id + '/page/' + this._id, { comment: commentText })
	.done(function(response){
		if(typeof callback === 'function'){
			callback();
		}
	}.bind(this));
};

wikiNamespace.Page.prototype.deleteComment = function(commentId, commentIndex, callback) {
	http().delete('/wiki/' + this.wiki_id + '/page/' + this._id + '/comment/' + commentId)
	.done(function(){
		this.comments.splice(commentIndex, 1);
		if(typeof callback === 'function'){
			callback();
		}
	}.bind(this));
};

wikiNamespace.Page.prototype.save = function(callback){
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

wikiNamespace.Page.prototype.toJSON = function(){
	return {
		title: this.title,
		content: this.content,
		isIndex: this.isIndex,
		wasIndex: this.wasIndex
	};
};

// Wikis
wikiNamespace.Wiki.prototype.getWholeWiki = function(callback) {
	http().get('/wiki/' + this._id + '/whole')
		.done(function(wiki){
			this.updateData(wiki);
			if(typeof callback === 'function'){
				callback();
			}
		}.bind(this));
};

wikiNamespace.Wiki.prototype.getPage = function(pageId, callback, errorCallback) {
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

wikiNamespace.Wiki.prototype.createPage = function(data, callback) {
	http().postJson('/wiki/' + this._id + '/page', data)
	.done(function(result){
		if(data.isIndex === true) {
			this.index = result._id;
		}
		callback(result);
	}.bind(this));
};

wikiNamespace.Wiki.prototype.deletePage = function(pageId, callback) {
	http().delete('/wiki/' + this._id + '/page/' + pageId).done(function(result){
		callback(result);
	});
};

wikiNamespace.Wiki.prototype.createWiki = function(data, callback) {
	http().postJson('/wiki', data).done(function(result){
		callback(result);
	});
};

wikiNamespace.Wiki.prototype.updateWiki = function(data, callback) {
	http().putJson('/wiki/' + this._id, data).done(function(){
		callback();
	});
};

wikiNamespace.Wiki.prototype.deleteWiki = function(callback) {
	http().delete('/wiki/' + this._id).done(function(){
		model.wikis.remove(this);
		callback();
	}.bind(this));
};

wikiNamespace.Wiki.prototype.listAllPages = function(callback) {
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

wikiNamespace.Wiki.prototype.setLastPages = function() {
	var dateArray = _.chain(this.pages.all).pluck("modified").compact().value();
	if(dateArray && dateArray.length > 0) {
		// get the last 5 modified pages
		this.lastPages = _.chain(this.pages.all)
							.filter(function(page){ return page.modified && page.modified.$date; })
							.sortBy(function(page){ return page.modified.$date; })
							.last(5)
							.reverse()
							.value();
	}
};


model.makeModels(wikiNamespace);


// 2) Behaviours
var wikiRights = {
	resources: {
		edit: {
			right: 'net-atos-entng-wiki-controllers-WikiController|updateWiki'
		},
		deleteWiki: {
			right: 'net-atos-entng-wiki-controllers-WikiController|deleteWiki'
		},
		share: {
			right: 'net-atos-entng-wiki-controllers-WikiController|shareWiki'
		},
		listPages: {
			right: 'net-atos-entng-wiki-controllers-WikiController|listPages'
		},
		getPage: {
			right: 'net-atos-entng-wiki-controllers-WikiController|getPage'
		},
		createPage: {
			right: 'net-atos-entng-wiki-controllers-WikiController|createPage'
		},
		editPage: {
			right: 'net-atos-entng-wiki-controllers-WikiController|updatePage'
		},
		deletePage: {
			right: 'net-atos-entng-wiki-controllers-WikiController|deletePage'
		},
		comment: {
			right: 'net-atos-entng-wiki-controllers-WikiController|comment'
		}
	},
	workflow: {
		create: 'net.atos.entng.wiki.controllers.WikiController|createWiki',
		list: 'net.atos.entng.wiki.controllers.WikiController|listWikis',
		view: 'net.atos.entng.wiki.controllers.WikiController|view',
		listAllPages: 'net.atos.entng.wiki.controllers.WikiController|listAllPages',
		print: 'net.atos.entng.wiki.controllers.WikiController|print'
	}
};

Behaviours.register('wiki', {
	namespace: wikiNamespace,
	rights: wikiRights,
	
	resource: function(resource){
		var rightsContainer = resource;
		if(!resource.myRights){
			resource.myRights = {};
		}
		
		for(var right in wikiRights.resources){
			if(model.me.hasRight(rightsContainer, wikiRights.resources[right]) || model.me.userId === resource.owner.userId){
				if(resource.myRights[right] !== undefined){
					resource.myRights[right] = resource.myRights[right] && wikiRights.resources[right];
				}
				else{
					resource.myRights[right] = wikiRights.resources[right];
				}
			}
		}
		return resource;
	},
	
	workflow: function(){
		var workflow = { };
		var wikiWorkflow = wikiRights.workflow;
		for(var prop in wikiWorkflow){
			if(model.me.hasWorkflow(wikiWorkflow[prop])){
				workflow[prop] = true;
			}
		}

		return workflow;
	},
	
	resourceRights: function(){
		return ['read', 'comment', 'contrib', 'manager'];
	},
	
	// Used by component "linker" to load wiki pages
	loadResources: function(callback){
		http().get('/wiki/listallpages').done(function(wikis) {
			var pagesArray = _.map(wikis, function(wiki) {
				var pages = _.map(wiki.pages, function(page) {
					var wikiIcon;
					if (typeof (wiki.thumbnail) === 'undefined' || wiki.thumbnail === '' ) {
						wikiIcon = '/img/icons/glyphicons_036_file.png';
					}
					else {
						wikiIcon = wiki.thumbnail + '?thumbnail=48x48';
					}
					
					return {
						title : page.title + ' [' + wiki.title + ']',
						ownerName : wiki.owner.displayName,
						owner : wiki.owner.userId,
						icon : wikiIcon,
						path : '/wiki#/view/' + wiki._id + '/' + page._id,
						wiki_id : wiki._id,
						id : page._id
					};
				});
				return pages;
			});
			
			this.resources = _.flatten(pagesArray);
			if(typeof callback === 'function'){
				callback(this.resources);
			}
		}.bind(this));
	},
	
	// Used by component "linker" to create a new page
	create: function(page, callback){
		page.loading = true;
		var data = {
				title : page.title,
				content : ''
		};
		
		http().postJson('/wiki/' + page.wiki_id + '/page', data).done(function(){
			this.loadResources(callback);
			page.loading = false;
		}.bind(this));		
	},
	
    sniplets: {
        wiki: {
        		// TODO i18n : lang.translate('wiki.title');
                title: lang.translate('wiki.sniplet.title'), 
                description: lang.translate('wiki.sniplet.description'), 
                controller: {
                    // Load wikis that can be selected when initializing a wiki sniplet
                    initSource: function() {
                        http().get('/wiki/list').done(function(pWikis) {
                                this.wikis = pWikis;
                                this.$apply('wikis');
                        }.bind(this));
                    },
                    
                    // Get data to display selected wiki
                    init: function() {
                    	console.log('Wiki - init function');
                    	var scope = this;
                    	console.log(scope.source);
                    	var wiki = new Behaviours.applicationsBehaviours.wiki.namespace.Wiki(scope.source);
                    	console.log(wiki);
                    	viewWiki(scope, wiki);
                    },
                    
                    getDateAndTime: function(dateObject) {
                    	return Behaviours.applicationsBehaviours.wiki.namespace.getDateAndTime(dateObject);
                    },
                    
                    getRelativeTimeFromDate: function(dateObject) {
                    	return Behaviours.applicationsBehaviours.wiki.namespace.getRelativeTimeFromDate(dateObject);
                    },
                    
                    toggleAccordion: function() {
                    	if(!this.accordionOp) {
                    		this.accordionOp = {value: 1};
                    	}
                    	else {
                    		this.accordionOp.value = (this.accordionOp.value === 1) ? -1 : 1;
                    	}
                    },
                    	
                    openPage: function(pageId) {
                    	var scope = this;
                        var wiki = this.wiki;
                        getPage(scope, wiki, pageId);
                        if(scope.accordionOp && scope.accordionOp.value === 1) {
                            scope.accordionOp.value = -1; // close accordion
                        }
                    },
                    
            		listPages: function(){
                    	var scope = this;
                    	var wiki = this.wiki;
                    	listPages(scope, wiki);
                        if(scope.accordionOp && scope.accordionOp.value === 1) {
                            scope.accordionOp.value = -1; // close accordion
                        }
            		},

            		newPage: function(){
            			var scope = this;
            			scope.wiki.newPage = new Behaviours.applicationsBehaviours.wiki.namespace.Page();
            			
    					if(scope.display) {
    						scope.display.action = 'createPage';
    					}
    					else {
    						scope.display = {action: 'createPage'};
    					}
            		},
            		
            		createPage: function(){
            			var scope = this;
            			var wiki = scope.wiki;
            			wiki.processing = true;
            			
            			if (Behaviours.applicationsBehaviours.wiki.namespace.titleIsEmpty(wiki.newPage.title)){
            				notify.error('wiki.form.title.is.empty');
            				wiki.processing = false;
            				return;
            			}
            			if(Behaviours.applicationsBehaviours.wiki.namespace.pageTitleExists(wiki.newPage.title, wiki)){
            				notify.error('wiki.page.form.titlealreadyexist.error');
            				wiki.processing = false;
            				return;
            			}
            			
            			var data = {
            				title : wiki.newPage.title,
            				content : wiki.newPage.content,
            				isIndex : wiki.newPage.isIndex
                		};

            			wiki.createPage(data, function(createdPage){
            				notify.info('wiki.page.has.been.created');
            				wiki.processing = false;
            				getPage(scope, wiki, createdPage._id);
            	        });
            		},
            		
            		cancelCreatePage: function(){
                    	viewWiki(this, this.wiki);
            		},
            		
            		editPage: function(){
            			var scope = this;
            			var wiki = scope.wiki;
            			
                    	wiki.editedPage = new Behaviours.applicationsBehaviours.wiki.namespace.Page(wiki.page);
                    	wiki.editedPage.isIndex = (wiki.editedPage._id === wiki.index);
                    	wiki.editedPage.wasIndex = (wiki.page._id === wiki.index);

            			if(scope.display) {
            				scope.display.action = 'editPage';
            			}
            			else {
            				scope.display = {action: 'editPage'};
            			}
            		},
            		
            		cancelEditPage: function(){
        				this.display.action = 'viewPage';
            		},
            		
            		updatePage: function(){
            			var scope = this;
            			var wiki = scope.wiki;
            			wiki.processing = true;
            			
            			if (Behaviours.applicationsBehaviours.wiki.namespace.titleIsEmpty(wiki.editedPage.title)){
            				notify.error('wiki.form.title.is.empty');
            				wiki.processing = false;
            				return;
            			}
            			if(Behaviours.applicationsBehaviours.wiki.namespace.pageTitleExists(wiki.editedPage.title, wiki, wiki.editedPage._id)){
            				notify.error('wiki.page.form.titlealreadyexist.error');
            				wiki.processing = false;
            				return;
            			}

            			wiki.page = wiki.editedPage;
            			wiki.page.save(function(result){
            				notify.info('wiki.page.has.been.updated');
            				wiki.processing = false;
            				getPage(scope, wiki, wiki.page._id);
            			});
            		},
            		
            		deletePage: function(){
                    	var scope = this;
                    	var wiki = scope.wiki;
                    	wiki.deletePage(wiki.page._id, function() {
                        	listPages(scope, wiki);	
                    	});
            		},
            		
                    getReferencedResources: function(source){
                        if(source._id){
                            return [source._id];
                        }
                    }
                }
        }
    }
});


// Functions used in sniplet's controller
function viewWiki(scope, wiki){
	wiki.pages.sync(function(){
		wiki.setLastPages();
		
        if(wiki.index && wiki.index.length > 0) {
            // Get index if it exists
			wiki.getPage(
				wiki.index, 
				function(result){ 
					scope.wiki = wiki;
					scope.wiki.behaviours('wiki');
					if(scope.display) {
						scope.display.action = 'viewPage';
					}
					else {
    					scope.display = {action: 'viewPage'};
					}
					scope.$apply();
				},
				function(){ } // TODO : scope.notFound=true;
    		);
        }
        else { // List pages
        	scope.wiki = wiki;
			scope.wiki.behaviours('wiki');
			if(scope.display) {
				scope.display.action = 'pagesList';
			}
			else {
				scope.display = {action: 'pagesList'};
			}
			scope.$apply();
        }
	});
}

function getPage(scope, wiki, pageId){
	wiki.pages.sync(function(){
		wiki.setLastPages();
		
		wiki.getPage(
			pageId, 
			function(result){
				if(scope.display) {
					scope.display.action = 'viewPage';
				}
				else {
					scope.display = {action: 'viewPage'};
				}
				scope.wiki = wiki;
				scope.$apply();
			},
			function(){ } // TODO : scope.notFound=true;
		);

	});	
}

function listPages(scope, wiki){
	wiki.pages.sync(function(){
		wiki.setLastPages();
		if(scope.display) {
			scope.display.action = 'pagesList';
		}
		else {
			scope.display = {action: 'pagesList'};
		}
	});
}
