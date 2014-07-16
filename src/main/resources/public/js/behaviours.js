var wikiBehaviours = {
	resources: {
		edit: {
			right: 'fr.wseduc.wiki.controllers.WikiController|updateWiki'
		},
		delete: {
			right: 'fr.wseduc.wiki.controllers.WikiController|deleteWiki'
		},
		share: {
			right: 'fr.wseduc.wiki.controllers.WikiController|shareWiki'
		},
		listPages: {
			right: 'fr.wseduc.wiki.controllers.WikiController|listPages'
		},
		getPage: {
			right: 'fr.wseduc.wiki.controllers.WikiController|getPage'
		},
		editPage: {
			right: 'fr.wseduc.wiki.controllers.WikiController|updatePage'
		},
		deletePage: {
			right: 'fr.wseduc.wiki.controllers.WikiController|deletePage'
		}
	},
	workflow: {
		create: 'fr.wseduc.wiki.controllers.WikiController|createWiki',
		list: 'fr.wseduc.wiki.controllers.WikiController|listWikis',
		view: 'fr.wseduc.wiki.controllers.WikiController|view',
		createPage: 'fr.wseduc.wiki.controllers.WikiController|createPage',
		listAllPages: 'fr.wseduc.wiki.controllers.WikiController|listAllPages'
	}
};

Behaviours.register('wiki', {
	behaviours: wikiBehaviours,
	resource: function(resource){
		console.log("Behaviours.resource call");
		var rightsContainer = resource;
		console.log(rightsContainer);
		
		if(!resource.myRights){
			resource.myRights = {};
		}
		
		for(var behaviour in wikiBehaviours.resources){
			console.log(wikiBehaviours.resources[behaviour]);
			if(model.me.hasRight(rightsContainer, wikiBehaviours.resources[behaviour])) {
				console.log("hasRight is true");
			}
			
			if(model.me.hasRight(rightsContainer, wikiBehaviours.resources[behaviour]) || model.me.userId === resource.owner.userId){
				if(resource.myRights[behaviour] !== undefined){
					resource.myRights[behaviour] = resource.myRights[behaviour] && wikiBehaviours.resources[behaviour];
				}
				else{
					resource.myRights[behaviour] = wikiBehaviours.resources[behaviour];
				}
			}
		}
		console.log(resource.myRights);
		return resource;
	},
	workflow: function(){
		console.log("Behaviours.workflow call");
		var workflow = { };
		var wikiWorkflow = wikiBehaviours.workflow;
		for(var prop in wikiWorkflow){
			if(model.me.hasWorkflow(wikiWorkflow[prop])){
				workflow[prop] = true;
			}
		}

		return workflow;
	},
	resourceRights: function(){
		return ['read', 'contrib', 'manager', 'comment'];
	},
	
	// Used by component "linker", to create hypertext links between wiki pages
	search : function(searchText, callback) {
		http().get('/wiki/listallpages').done(
				function(wikis) {
	
					var pagesArray = _.map(
							wikis, 
							function(wiki) {
								var pages = wiki.pages;
								
								// Keep pages whose title contain searchText, or whose id equals searchText
								pages = _.filter(pages, function(page) {
									return lang.removeAccents(page.title.toLowerCase())
											.indexOf(
													lang.removeAccents(searchText)
															.toLowerCase()) !== -1
											|| page._id === searchText;
								});
								
								pages = _.map(pages, function(page) {
									return {
										title : page.title + ' [' + wiki.title + ']',
										ownerName : wiki.owner.displayName,
										owner : wiki.owner.userId,
										icon : '/img/icons/unknown-large.png', // TODO : à modifier
										path : '/wiki#/view/' + wiki._id + '/' + page._id,
										id : page._id
									};
								});
								
								return pages;
							}
					);
					pagesArray = _.flatten(pagesArray);
						
					callback(pagesArray);
				});
	}
});