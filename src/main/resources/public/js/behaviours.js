var wikiBehaviours = {
	resources: {
		edit: {
			right: 'fr-wseduc-wiki-controllers-WikiController|updateWiki'
		},
		deleteWiki: {
			right: 'fr-wseduc-wiki-controllers-WikiController|deleteWiki'
		},
		share: {
			right: 'fr-wseduc-wiki-controllers-WikiController|shareWiki'
		},
		listPages: {
			right: 'fr-wseduc-wiki-controllers-WikiController|listPages'
		},
		getPage: {
			right: 'fr-wseduc-wiki-controllers-WikiController|getPage'
		},
		createPage: {
			right: 'fr-wseduc-wiki-controllers-WikiController|createPage'
		},
		editPage: {
			right: 'fr-wseduc-wiki-controllers-WikiController|updatePage'
		},
		deletePage: {
			right: 'fr-wseduc-wiki-controllers-WikiController|deletePage'
		}
	},
	workflow: {
		create: 'fr.wseduc.wiki.controllers.WikiController|createWiki',
		list: 'fr.wseduc.wiki.controllers.WikiController|listWikis',
		view: 'fr.wseduc.wiki.controllers.WikiController|view',
		listAllPages: 'fr.wseduc.wiki.controllers.WikiController|listAllPages'
	}
};

Behaviours.register('wiki', {
	behaviours: wikiBehaviours,
	resource: function(resource){
		var rightsContainer = resource;
		if(!resource.myRights){
			resource.myRights = {};
		}
		
		for(var behaviour in wikiBehaviours.resources){
			if(model.me.hasRight(rightsContainer, wikiBehaviours.resources[behaviour]) || model.me.userId === resource.owner.userId){
				if(resource.myRights[behaviour] !== undefined){
					resource.myRights[behaviour] = resource.myRights[behaviour] && wikiBehaviours.resources[behaviour];
				}
				else{
					resource.myRights[behaviour] = wikiBehaviours.resources[behaviour];
				}
			}
		}
		return resource;
	},
	workflow: function(){
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
						path : '/wiki?wiki=' + wiki._id + '&page=' + page._id,
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
		
	}
});