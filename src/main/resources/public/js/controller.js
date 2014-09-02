routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wikiId', {
        action: 'listPages'
      })
      .when('/view/:wikiId/:pageId', {
        action: 'viewPage'
      })
      .otherwise({
        action: 'defaultView'
      });
});


function WikiController($scope, template, model, route){

	var parseQueryString = function(queryString) {
	    var params = {}, temp, i;
	    var queries = queryString.split("&");
	 
	    for (i=0; i<queries.length; i++) {
	    	 // Split into key/value pairs
	        temp = queries[i].split('=');
	        params[temp[0]] = temp[1];
	    }
	 
	    return params;
	};
	
	
	$scope.template = template;
	$scope.display = {showPanel: false, viewWikisAs: 'list'};
	$scope.wiki = new Wiki();
	$scope.applicationName = lang.translate('wiki.title');
	
	$scope.isCreatingOrEditing = function(){
		return (template.contains('main', 'create-wiki') || 
				template.contains('main', 'edit-wiki') || 
				template.contains('main', 'create-page') ||  
				template.contains('main', 'edit-page'));
	}
	
	// Used to feed search bar
	$scope.wiki.listAllPages( function(pagesArray) {
			$scope.allpageslist = pagesArray;
		}
	);
	
	route({
		listPages: function(params){
			$scope.listPages(params.wikiId);
		},
		defaultView: function(){
			// Linker case - when accessing a page via URL ?wiki=wikiId&page=pageId
			var queryString = window.location.search;
			if(typeof (queryString) !== undefined) {
				queryString = queryString.substring(1); // remove character '?'
				var parameters = parseQueryString(queryString);
				if(parameters.wiki && parameters.page) {
					model.wikis.one('sync', function(){
				    	$scope.openSelectedPage(parameters.wiki, parameters.page);
					});
					model.wikis.sync();
					return;
				}
			}
			
			// Default case
	    	$scope.displayWikiList();
	    },
	    viewPage: function(params){
			model.wikis.one('sync', function(){
		    	$scope.openSelectedPage(params.wikiId, params.pageId);
			});
			model.wikis.sync();
	    }
	});
	
	template.open('main', 'list-wikis');
	
    $scope.formatDate = function(dateObject){
    	return moment(dateObject.$date).lang('fr').format('dddd DD MMM YYYY, HH:mm:ss');
    };	
	
	$scope.deleteWikiSelection = function(){
		_.map($scope.wikis.selection(), function(wikiToRemove){
			wikiToRemove.deleteWiki( function(){
						// Updates variable "allpageslist" for search bar, without any server call
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
		// Check field "title"
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
    	template.open("main", "edit-wiki");
    };
    
	$scope.cancelEditWiki = function(){
		$scope.displayWikiList();
	};
    
	$scope.updateWiki = function(){
		// Check field "title"
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
			// Updates "allpageslist" for search bar
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
			});
			
			$scope.displayWikiList();
		});
	};
	
	$scope.displayWikiList = function(){
    	model.wikis.one('sync', function(){
	    	delete $scope.selectedWiki;
	    	window.location.hash = '';
			template.open('main', 'list-wikis');
    	});
    	model.wikis.sync();
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
	
	$scope.listPages = function(wikiId){
		model.wikis.one('sync', function(){
			$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
				return wiki._id === wikiId;
			});
			$scope.selectedWiki.pages.sync(function(){
				template.open('main', 'list-wiki-pages');
				window.location.hash = '/view/' + wikiId;
	        });
		});
		
		model.wikis.sync();
	}

	$scope.openSelectedWiki = function(selectedWiki){
		$scope.listPages(selectedWiki._id);
	}
	
	$scope.openSelectedPage = function(wikiId, pageId){
		template.open('main', 'view-page');
    	$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
			return wiki._id === wikiId;
		});
    	if(!$scope.selectedWiki) {
    		notify.error('wiki.notfound');
    		return;
    	}
    	$scope.selectedWiki.getPage(pageId, function(result){
            window.location.hash = '/view/' + wikiId + '/' + pageId;
        });
	}
		
	$scope.newPage = function(){
		$scope.page = new Page();
		template.open('main', 'create-page');
	}
	
	$scope.cancelCreatePage = function(selectedWiki){
		template.open('main', 'list-wiki-pages');
	}

	$scope.page = new Page();
	
	$scope.createPage = function(){
		// Check field "title"
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
		
		template.open('main', 'view-page');
		
		var data = {
				title : $scope.page.title,
				content : $scope.page.content
		};
		$scope.selectedWiki.createPage(data, function(result){
			// Updates "allpageslist" for search bar
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
	        $scope.selectedWiki.getPage(result._id, function(returnedWiki){
				window.location.hash = '/view/' + $scope.selectedWiki._id + '/' + result._id;
	        });

        });
	};
	
	$scope.editPage = function(selectedWiki) {
		$scope.selectedWiki.editedPage = new Page();
		$scope.selectedWiki.editedPage.updateData(selectedWiki.page);
		template.open('main', 'edit-page');
	}
	
	$scope.cancelEditPage = function(selectedWiki) {
        template.open('main', 'view-page');
	}
	
	$scope.updatePage = function(){
		// Check field "title"
		if (!$scope.selectedWiki.editedPage.title || $scope.selectedWiki.editedPage.title.trim().length === 0){
			return;
		}
		if( _.find($scope.selectedWiki.pages.all, function(page){
					return page.title.trim() === $scope.selectedWiki.editedPage.title.trim() && 
							page._id !== $scope.selectedWiki.editedPage._id;
				})
		){
			notify.error('wiki.page.editform.titlealreadyexist.error');
			return;
		}
		
		var data = {
				title : $scope.selectedWiki.editedPage.title,
				content : $scope.selectedWiki.editedPage.content
		};
		$scope.selectedWiki.page = $scope.selectedWiki.editedPage;
		template.open('main', 'view-page');
		
		$scope.selectedWiki.updatePage(data, $scope.selectedWiki.editedPage._id, function(result){
			// Updates "allpageslist" for search bar
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
        });
	};
	
	$scope.deletePage = function(){
		$scope.selectedWiki.deletePage($scope.selectedWiki._id, $scope.selectedWiki.page._id, function(result){
			// Updates "allpageslist" for search bar
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
			window.location.hash = '/view/' + $scope.selectedWiki._id;
			$scope.listPages($scope.selectedWiki._id);
        });
	};
	
	$scope.wikis = model.wikis;
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
