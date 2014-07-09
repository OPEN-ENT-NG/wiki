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
	            template.open('main', 'view-wiki-page');
	        });
	    },
	    listWikis: function(params){
	      template.open('main', 'list-wikis');
	    },
	    editPage: function(params){
			template.open('main', 'edit-page');
		}
	});
	
    $scope.formatDate = function(date){
    	// TODO : à corriger
        var momentDate = moment(date);
        return momentDate.lang('fr').format('dddd DD MMM YYYY, hh:mm:ss');
    };
	
	// fix temporaire en attendant une nouvelle version d'ent-core
	template.open('main', 'list-wikis');
		
	$scope.deleteWiki = function(wikiToRemove){
		wikiToRemove.deleteWiki();
	};
	
	$scope.displayNewWikiForm = function(){
		template.open("main", "create-wiki");
	};
	
	$scope.wiki = new Wiki();
	
	$scope.createNewWiki = function(){
		var data = {
				title : $scope.wiki.title
		};
		// TODO : appel REST à déplacer dans le model
		http().postJson('/wiki', data).done(function(createdWiki){
			$scope.wiki = new Wiki();

			var aWiki = new Wiki();
			aWiki.title = data.title;
			aWiki._id = createdWiki._id;
			$scope.openSelectedWiki(aWiki);
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

	$scope.page = new Page();
	
	$scope.createPage = function(){
		var data = {
				title : $scope.page.title,
				content : $scope.page.content
		};
		$scope.selectedWiki.createPage(data, function(result){
			window.location.href = '/wiki#/view/' + $scope.selectedWiki._id + '/' + result._id;
        });
	};
	
	$scope.editPage = function(selectedWiki) {
		$scope.selectedWiki.page.title = selectedWiki.page.title;
		$scope.selectedWiki.page.content = selectedWiki.page.content;
		$scope.selectedWiki.page._id = selectedWiki.page._id;
		window.location.href = '/wiki#/edit/' + $scope.selectedWiki._id + '/' + selectedWiki.page._id;
	}
	
	$scope.updatePage = function(){
		var data = {
				title : $scope.selectedWiki.page.title,
				content : $scope.selectedWiki.page.content
		};
		$scope.selectedWiki.updatePage(data, $scope.selectedWiki.page._id, function(result){
			window.location.href = '/wiki#/view/' + $scope.selectedWiki._id + '/' + $scope.selectedWiki.page._id;
        });
	};
	
	$scope.deletePage = function(){
		$scope.selectedWiki.deletePage($scope.selectedWiki._id, $scope.selectedWiki.page._id, function(result){
			$scope.selectedWiki.pages.sync();
			window.location.href = '/wiki#/view/' + $scope.selectedWiki._id;
        });
	};
	
	
	$scope.wikis = model.wikis;
	$scope.titleOfNewWiki = "Titre";
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
