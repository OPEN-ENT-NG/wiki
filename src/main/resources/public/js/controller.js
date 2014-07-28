routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wikiId', {
        action: 'listPages'
      })
      .when('/view/:wikiId/:pageId', {
        action: 'viewPage'
      })
      .when('/wiki-list', {
        action: 'listWikis'
      })
      .when('/edit/:wikiId', {
        action: 'editWiki'
      })
      .when('/edit/:wikiId/:pageId', {
        action: 'editPage'
      })
      .otherwise({
        redirectTo: '/wiki-list'
      });
});


function WikiController($scope, template, model, route){

	$scope.template = template;
	$scope.display = {showPanel: false, viewWikisAs: 'list'};
	$scope.wiki = new Wiki();
	$scope.applicationName = lang.translate('wiki.title');
	
	// Utilise pour alimenter la barre de recherche des pages
	$scope.wiki.listAllPages( function(pagesArray) {
			$scope.allpageslist = pagesArray;
		}
	);
	
	// Definition des actions
	route({
		listPages: function(params){
			model.wikis.one('sync', function(){
				$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
					return wiki._id === params.wikiId;
				});
				$scope.selectedWiki.pages.sync(function(){
					template.open('main', 'list-wiki-pages');
		        });
			});
			model.wikis.sync();
		},
	    viewPage: function(params){
			$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
				return wiki._id === params.wikiId;
			});
	    	$scope.selectedWiki.findPage(params.pageId, function(result){
	            template.open('main', 'view-page');
	        });
	    },
	    listWikis: function(params){
	    	delete $scope.selectedWiki;
			template.open('main', 'list-wikis');
	    },
	    editWiki: function(params){
	    	template.open("main", "edit-wiki");
		},
	    editPage: function(params){
			template.open('main', 'edit-page');
		}
	});
	
	// fix temporaire en attendant une nouvelle version d'ent-core
	template.open('main', 'list-wikis');
	
    $scope.formatDate = function(dateObject){
    	return moment(dateObject.$date).lang('fr').format('dddd DD MMM YYYY, HH:mm:ss');
    };	
	
	$scope.deleteWikiSelection = function(){
		_.map($scope.wikis.selection(), function(wikiToRemove){
			wikiToRemove.deleteWiki( function(){
						// Maj de allpageslist, SANS appel serveur, pour la barre de recherche
						$scope.allpageslist = _.filter($scope.allpageslist, function(page){
							return page.wiki_id !== wikiToRemove._id;
						});
			});
		});
		
		$scope.display.showConfirmDelete = false;
	};
	
	
	$scope.shareWiki = function(wiki){
		$scope.currentWiki = wiki;
		$scope.display.showPanel = true;
	};

	$scope.displayCreateWikiForm = function(){
		$scope.wiki = new Wiki();
		template.open("main", "create-wiki");
	};
	
	$scope.createNewWiki = function(){
		// Verification du champ titre
		if (!$scope.wiki.title || $scope.wiki.title.trim().length === 0){
			return;
		}
		if( _.find(model.wikis.all, function(wiki){
			return $scope.wiki.title.trim() === wiki.title.trim() && 
					model.me.userId === wiki.owner.userId;
			})
		){
			notify.error('wiki.createform.titlealreadyexist.error');
			return;
		}
		
		var wikidata = {
				title : $scope.wiki.title,
				thumbnail : $scope.wiki.thumbnail
		};

		$scope.wiki.createWiki(wikidata, function(createdWiki){
			$scope.wiki = new Wiki();

			var aWiki = new Wiki();
			aWiki._id = createdWiki._id;
			$scope.openSelectedWiki(aWiki);
		});
	};
	
	$scope.cancelCreateWiki = function(){
		template.open('main', 'list-wikis');
	};
	
    $scope.displayEditWikiForm = function(wiki){
    	$scope.wiki = wiki;
    	window.location.href = '/wiki#/edit/' + wiki._id;
    };
    
	$scope.cancelEditWiki = function(){
		$scope.displayWikiList();
	};
    
	$scope.updateWiki = function(){
		// Verification du champ titre
		if (!$scope.wiki.title || $scope.wiki.title.trim().length === 0){
			return;
		}
		if( _.find(model.wikis.all, function(wiki){
			return ($scope.wiki.title.trim() === wiki.title.trim() && 
					model.me.userId === wiki.owner.userId && 
					wiki._id !== $scope.wiki._id);
			})
		){
			notify.error('wiki.editform.titlealreadyexist.error');
			return;
		}
		
		var data = {
				title : $scope.wiki.title,
				thumbnail : $scope.wiki.thumbnail,
		};
		$scope.wiki.updateWiki(data, function(){
			// Maj de allpageslist pour la barre de recherche
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
			});
			
			$scope.displayWikiList();
		});
	};
	
	$scope.displayWikiList = function(){
		model.wikis.sync();
		window.location.href = '/wiki#/wiki-list';
	}
	
	$scope.switchAllWikis = function(){
		if($scope.display.selectWikis){
			$scope.wikis.selectAll();
		}
		else{
			$scope.wikis.deselectAll();
		}
	};
	
	$scope.getWikiThumbnail = function(wiki){
		if(!wiki.thumbnail || wiki.thumbnail === ''){
			return '/img/illustrations/blog.png';
		}
		return wiki.thumbnail + '?thumbnail=120x120';
	};
	
	$scope.listPages = function(selectedWiki){
		window.location.href = '/wiki#/view/' + selectedWiki._id;
	}

	$scope.openSelectedWiki = function(selectedWiki){
		$scope.listPages(selectedWiki);
	}
	
	$scope.openSelectedPage = function(wikiId, pageId){
    	$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
			return wiki._id === wikiId;
		});
    	$scope.selectedWiki.findPage(pageId, function(result){
            window.location.href = '/wiki#/view/' + wikiId + '/' + pageId;
        });
	}
		
	$scope.newPage = function(selectedWiki){
		$scope.page = new Page();
		$scope.selectedWiki = selectedWiki;
		template.open('main', 'create-page');
	}
	
	$scope.cancelCreatePage = function(selectedWiki){
		template.open('main', 'list-wiki-pages');
	}

	$scope.page = new Page();
	
	$scope.createPage = function(){
		// Verification du champ titre
		if (!$scope.page.title || $scope.page.title.trim().length === 0){
			return;
		}
		if( _.find($scope.selectedWiki.pages.all, function(page){
				return page.title.trim() === $scope.page.title.trim();
			})
		){
			notify.error('wiki.page.createform.titlealreadyexist.error');
			return;
		}
		
		var data = {
				title : $scope.page.title,
				content : $scope.page.content
		};
		$scope.selectedWiki.createPage(data, function(result){
			// Maj de allpageslist pour la barre de recherche
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
			window.location.href = '/wiki#/view/' + $scope.selectedWiki._id + '/' + result._id;
        });
	};
	
	$scope.editPage = function(selectedWiki) {
		$scope.selectedWiki.page.title = selectedWiki.page.title;
		$scope.selectedWiki.page.content = selectedWiki.page.content;
		$scope.selectedWiki.page._id = selectedWiki.page._id;
		window.location.href = '/wiki#/edit/' + $scope.selectedWiki._id + '/' + selectedWiki.page._id;
	}
	
	$scope.cancelEditPage = function(selectedWiki) {
		$scope.openSelectedPage(selectedWiki._id, selectedWiki.page._id);
	}
	
	$scope.updatePage = function(){
		// Verification du champ titre
		if (!$scope.selectedWiki.page.title || $scope.selectedWiki.page.title.trim().length === 0){
			return;
		}
		if( _.find($scope.selectedWiki.pages.all, function(page){
					return page.title.trim() === $scope.selectedWiki.page.title.trim() && 
							page._id !== $scope.selectedWiki.page._id;
				})
		){
			notify.error('wiki.page.editform.titlealreadyexist.error');
			return;
		}
		
		var data = {
				title : $scope.selectedWiki.page.title,
				content : $scope.selectedWiki.page.content
		};
		$scope.selectedWiki.updatePage(data, $scope.selectedWiki.page._id, function(result){
			// Maj de allpageslist pour la barre de recherche
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
			window.location.href = '/wiki#/view/' + $scope.selectedWiki._id + '/' + $scope.selectedWiki.page._id;
        });
	};
	
	$scope.deletePage = function(){
		$scope.selectedWiki.deletePage($scope.selectedWiki._id, $scope.selectedWiki.page._id, function(result){
			// Maj de allpageslist pour la barre de recherche
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
			window.location.href = '/wiki#/view/' + $scope.selectedWiki._id;
        });
	};
	
	$scope.wikis = model.wikis;
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
