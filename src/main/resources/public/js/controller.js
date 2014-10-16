routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wikiId', {
        action: 'viewWiki'
      })
		.when('/view/:wikiId/list-pages', {
			action: 'listPages'
		})
      .when('/view/:wikiId/:pageId', {
        action: 'viewPage'
      })
      .otherwise({
    	  action: 'defaultView'
      });
});


function WikiController($scope, template, model, route, $location){
	
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
	$scope.display = {showPanel: false, showPanelForCurrentWiki: false};
	$scope.wiki = new Wiki();
	$scope.applicationName = lang.translate('wiki.title');
	$scope.notFound = false;
	$scope.me = model.me;
	
	var setLastPages = function(wiki) {
		var dateArray = _.chain(wiki.pages.all).pluck("modified").compact().value();
		if(dateArray && dateArray.length > 0) {
			// get the last 5 modified pages
			wiki.lastPages = _.chain(wiki.pages.all)
								.filter(function(page){ return page.modified && page.modified.$date })
								.sortBy(function(page){ return page.modified.$date; })
								.last(5)
								.reverse()
								.value();
		}
	}
	
	$scope.isCreatingOrEditing = function(){
		return (template.contains('main', 'create-wiki') || 
				template.contains('main', 'edit-wiki') || 
				template.contains('main', 'create-page') ||  
				template.contains('main', 'edit-page'));
	};
	
	// Functions to check rights
	$scope.canCreatePage = function(wiki){
	    return wiki.myRights.createPage !== undefined;
	};
	
	$scope.canManageWiki = function(wiki){
		return (wiki.myRights.edit !== undefined || 
				wiki.myRights.deleteWiki !== undefined || 
				wiki.myRights.share !== undefined)
	};


	// Used to feed search bar
	$scope.wiki.listAllPages( function(pagesArray) {
			$scope.allpageslist = pagesArray;
		}
	);
	
	route({
		viewWiki: function(params){
			$scope.viewWiki(params.wikiId);
		},
	    viewPage: function(params){
			model.wikis.one('sync', function(){
		    	$scope.openSelectedPage(params.wikiId, params.pageId);
			});
			model.wikis.sync();
	    },
		listPages: function(params){
			model.wikis.one('sync', function(){
				$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
					return wiki._id === params.wikiId;
				});
				$scope.selectedWiki.pages.sync(function(){
					setLastPages($scope.selectedWiki);
					template.open('main', 'list-wiki-pages');
				});
			});
			model.wikis.sync();
		},
        defaultView: function(){
            // Print case : when accessing a page via URL /wiki/print?wiki=wikiId
			if(window.location.href.indexOf('print') !== -1){
	            var queryString = window.location.search;
	            if(typeof (queryString) !== undefined) {
	                queryString = queryString.substring(1); // remove character '?'
	                var parameters = parseQueryString(queryString);
	                if(parameters.wiki) {
	                	$scope.selectedWiki = new Wiki({_id: parameters.wiki});
	                	$scope.selectedWiki.getWholeWiki(function() {
	                		$scope.selectedWiki.pages.all = _.sortBy($scope.selectedWiki.pages.all, function(page) {
	            				return page.title.toLowerCase();
	            			});
	                		setTimeout(function(){window.print();}, 1000);
	                	});
	                    return;
	                }
	            }
			}
            
            // Default case
		    $scope.displayWikiList();
        }
	});
	
    // View initialization
	template.open('sideMenu', 'side-menu');
	template.open('main', 'list-wikis');
	
	// Date functions
    $scope.formatDate = function(dateObject){
    	return moment(dateObject.$date).lang('fr').format('D/MM/YYYY');
    };
    
    $scope.getDateAndTime = function(dateObject){
    	return moment(dateObject.$date).lang('fr').format('LLLL');
    };
    
    $scope.getRelativeTimeFromDate = function(dateObject){
    	return moment(dateObject.$date).lang('fr').fromNow();
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
			notify.error('wiki.form.title.is.empty');
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
			$scope.viewWiki(createdWiki._id);
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
			notify.error('wiki.form.title.is.empty');
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
	};
	
	$scope.getWikiThumbnail = function(wiki){
		if(!wiki.thumbnail || wiki.thumbnail === ''){
			return '/img/illustrations/wiki-default.png';
		}
		return wiki.thumbnail + '?thumbnail=120x120';
	};
	
	$scope.viewWiki = function(wikiId){
		model.wikis.one('sync', function(){
			$scope.openSelectedWiki(wikiId);
		});
		
		model.wikis.sync();
	};

	$scope.openSelectedWiki = function(wikiId){
		$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
			return wiki._id === wikiId;
		});
    	if(!$scope.selectedWiki) {
    		$scope.notFound = true;
    		return;
    	}
		if($scope.selectedWiki.index && $scope.selectedWiki.index.length > 0) {
			// Open index if it exists
			$scope.openSelectedPage($scope.selectedWiki._id, $scope.selectedWiki.index);
		}
		else { // List pages
			$scope.selectedWiki.pages.sync(function(){
				setLastPages($scope.selectedWiki);
				template.open('main', 'list-wiki-pages');
				window.location.hash = '/view/' + $scope.selectedWiki._id;
	        });
		}
	};
	
	$scope.listPages = function(wikiId){
		$location.path('/view/' + $scope.selectedWiki._id + '/list-pages');
	};

	$scope.openSelectedPage = function(wikiId, pageId){
    	$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
			return wiki._id === wikiId;
		});
    	if(!$scope.selectedWiki) {
    		$scope.notFound = true;
    		return;
    	}
    	
		$scope.selectedWiki.pages.sync(function(){
			setLastPages($scope.selectedWiki);
			template.open('main', 'view-page');
			$scope.selectedWiki.getPage(
				pageId, 
				function(result){
					window.location.hash = '/view/' + wikiId + '/' + pageId;
					$scope.$apply();
				},
				function(){
					$scope.notFound=true;
				}
			);
		});

	};

	$scope.newPage = function(){
		$scope.page = new Page();
		template.open('main', 'create-page');
	};
	
	$scope.cancelCreatePage = function(selectedWiki){
		$scope.selectedWiki = _.find(model.wikis.all, function(wiki){
			return wiki._id === selectedWiki._id;
		});
		if($scope.selectedWiki.index && selectedWiki.page && selectedWiki.index === selectedWiki.page._id) {
			// Open index if it exists
			template.open('main', 'view-page');
		}
		else { // List pages
			template.open('main', 'list-wiki-pages');
		}
	};

	$scope.page = new Page();
	
	$scope.createPage = function(){
		// Check field "title"
		if (!$scope.page.title || $scope.page.title.trim().length === 0){
			notify.error('wiki.form.title.is.empty');
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
			content : $scope.page.content,
			isIndex : $scope.page.isIndex
		};
		$scope.selectedWiki.createPage(data, function(result){
			// Updates "allpageslist" for search bar
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
			$scope.selectedWiki.pages.sync(function(){
				setLastPages($scope.selectedWiki);
		        $scope.selectedWiki.getPage(result._id, function(returnedWiki){
					window.location.hash = '/view/' + $scope.selectedWiki._id + '/' + result._id;
		        });
			});
        });
	};
	
	$scope.editPage = function(selectedWiki) {
		$scope.selectedWiki.editedPage = new Page();
		$scope.selectedWiki.editedPage.updateData(selectedWiki.page);
		$scope.selectedWiki.editedPage.isIndex = ($scope.selectedWiki.editedPage._id === $scope.selectedWiki.index)
		$scope.selectedWiki.editedPage.wasIndex = (selectedWiki.page._id === $scope.selectedWiki.index)
		template.open('main', 'edit-page');
	};
	
	$scope.cancelEditPage = function(selectedWiki) {
        template.open('main', 'view-page');
	};
	
	$scope.updatePage = function(){
		// Check field "title"
		if (!$scope.selectedWiki.editedPage.title || $scope.selectedWiki.editedPage.title.trim().length === 0){
			notify.error('wiki.form.title.is.empty');
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
				content : $scope.selectedWiki.editedPage.content,
				isIndex : $scope.selectedWiki.editedPage.isIndex,
				wasIndex : $scope.selectedWiki.editedPage.wasIndex
		};
		$scope.selectedWiki.page = $scope.selectedWiki.editedPage;
		template.open('main', 'view-page');
		
		$scope.selectedWiki.updatePage(data, $scope.selectedWiki.editedPage._id, function(result){
			// Updates "allpageslist" for search bar
			$scope.wiki.listAllPages( function(pagesArray) {
					$scope.allpageslist = pagesArray;
				}
			);
			
			$scope.selectedWiki.pages.sync(function(){
				setLastPages($scope.selectedWiki);
		        $scope.selectedWiki.getPage($scope.selectedWiki.page._id, function(returnedWiki){
					window.location.hash = '/view/' + $scope.selectedWiki._id + '/' + $scope.selectedWiki.page._id;
					$scope.$apply();
		        });
			});

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
