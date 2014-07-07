routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wikiId/:pageId', {
        action: 'viewPage'
      })
      .when('/wiki-list', {
        action: 'viewWikiList'
      })
      .otherwise({
        redirectTo: '/wiki-list'
      })
});


function WikiController($scope, template, model, route){

	$scope.template = template;
	
	// Definition des actions
	route({
	    viewPage: function(params){
	    	$scope.selectedWiki = new Wiki({ _id: params.wikiId});
	    	$scope.selectedWiki.getWikiInfo();
	    	$scope.selectedWiki.findPage(params.pageId);
	    	template.open('main', 'view-wiki-page');
	    },
	    viewWikiList: function(params){
	      template.open('main', 'list-wikis');
	    }
	});
	
    $scope.formatDate = function(date){
        var momentDate = moment(date);
        return momentDate.lang('fr').format('dddd DD MMM YYYY, hh:mm:ss');
    };
	
	// fix temporaire en attendant une nouvelle version d'ent-core
	template.open('main', 'list-wikis');
		
	$scope.deleteWiki = function(wikiToRemove){
		model.wikis.remove(wikiToRemove);
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
		http().postJson('/wiki', data).done(function(createdWiki){
			$scope.wiki = new Wiki();

			var aWiki = new Wiki();
			aWiki.title = data.title;
			aWiki._id = createdWiki._id;
			$scope.openSelectedWiki(aWiki);
		});
		
	};

	$scope.openSelectedWiki = function(selectedWiki){
		$scope.selectedWiki = selectedWiki;
		selectedWiki.getMainPage();
		template.open('main', 'view-wiki-page');
	}
	
	$scope.displayWikiList = function(){
		template.open('main', 'list-wikis');
	}
	
	$scope.listPages = function(selectedWiki){
		$scope.selectedWiki = selectedWiki;
		$scope.selectedWiki = new Wiki({ _id: selectedWiki._id });
		$scope.selectedWiki.getWikiInfo();				
		$scope.selectedWiki.pages.sync();
		
		template.open('main', 'list-wiki-pages');
	}
	
	$scope.openSelectedPage = function(wikiId, pageId){
    	$scope.selectedWiki = new Wiki({ _id: wikiId});
    	$scope.selectedWiki.getWikiInfo();
    	$scope.selectedWiki.findPage(pageId);
    	template.open('main', 'view-wiki-page');
	}
	
	$scope.newPage = function(){
		template.open('main', 'create-page');
	}

	$scope.page = new Page();
	
	$scope.savePage = function(){
		var data = {
				title : $scope.page.title,
				content : $scope.page.content
		};
		$scope.selectedWiki.createPage(data);
		
		// TODO : display created page
		
		$scope.page = new Page();
		
	};
	
	$scope.wikis = model.wikis;
	$scope.titleOfNewWiki = "Titre";
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
