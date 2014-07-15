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
      .when('/edit/:wikiId/:pageId', {
        action: 'editPage'
      })
      .otherwise({
        redirectTo: '/wiki-list'
      })
});


function WikiController($scope, template, model, route){

	$scope.template = template;
	$scope.display = {showPanel: false};
	$scope.wiki = new Wiki();
	
	// Utilise pour alimenter la barre de recherche des pages
	$scope.wiki.listAllPages( function(pagesArray) {
			$scope.allpageslist = pagesArray;
		}
	);
	
	// Definition des actions
	route({
		listPages: function(params){
			$scope.selectedWiki = new Wiki({ _id: params.wikiId });
			$scope.selectedWiki.pages.sync(function(){
				template.open('main', 'list-wiki-pages');
	        });			
		},
	    viewPage: function(params){
	    	$scope.selectedWiki = new Wiki({ _id: params.wikiId});
	    	$scope.selectedWiki.findPage(params.pageId, function(result){
	            template.open('main', 'view-page');
	        });
	    },
	    listWikis: function(params){
	      template.open('main', 'list-wikis');
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
	
	$scope.deleteWiki = function(wikiToRemove){
		wikiToRemove.deleteWiki(
			function(){
				// Maj de allpageslist pour la barre de recherche
				$scope.wiki.listAllPages( function(pagesArray) {
						$scope.allpageslist = pagesArray;
				});
			} 
		);
	};
	
	$scope.shareWiki = function(wiki){
		$scope.currentWiki = wiki;
		$scope.display.showPanel = true;
	};

	
	$scope.displayCreateWikiForm = function(){
		$scope.wiki = new Wiki( { title: "Titre" } );
		template.open("main", "create-wiki");
	};
	
	$scope.createNewWiki = function(){
		var data = {
				title : $scope.wiki.title
		};
		$scope.wiki.createWiki(data, function(createdWiki){
			$scope.wiki = new Wiki();

			var aWiki = new Wiki();
			aWiki.title = data.title;
			aWiki._id = createdWiki._id;
			$scope.openSelectedWiki(aWiki);
		});
	};
	
	$scope.cancelCreateWiki = function(){
		$scope.displayWikiList();
	};
	
    $scope.displayEditWikiForm = function(wiki){
    	$scope.wiki = wiki;
    	template.open("main", "edit-wiki");
    };
    
	$scope.cancelEditWiki = function(){
		$scope.displayWikiList();
	};
    
	$scope.renameWiki = function(){
		var data = {
				title : $scope.wiki.title
		};
		$scope.wiki.renameWiki(data, function(){
			$scope.displayWikiList();
		});
	};

	$scope.displayWikiList = function(){
		model.wikis.sync();
		window.location.href = '/wiki#//wiki-list';
	}
	
	$scope.listPages = function(selectedWiki){
		$scope.selectedWiki = selectedWiki;
		window.location.href = '/wiki#/view/' + selectedWiki._id;
	}

	$scope.openSelectedWiki = function(selectedWiki){
		$scope.listPages(selectedWiki);
	}
	
	$scope.openSelectedPage = function(wikiId, pageId){
    	$scope.selectedWiki = new Wiki({ _id: wikiId});
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
			$scope.selectedWiki.pages.sync();
			
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
