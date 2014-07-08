routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wikiId/:pageId', {
        action: 'viewPage'
      })
      .when('/wiki-list', {
        action: 'viewWikiList'
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
	    viewPage: function(params){
	    	$scope.selectedWiki = new Wiki({ _id: params.wikiId});
	    	$scope.selectedWiki.getWikiInfo();
	    	$scope.selectedWiki.findPage(params.pageId, function(result){
	            template.open('main', 'view-wiki-page');
	        });
	    },
	    viewWikiList: function(params){
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
		template.open('main', 'list-wikis');
	}
	
	$scope.listPages = function(selectedWiki){
		$scope.selectedWiki = selectedWiki;
		$scope.selectedWiki = new Wiki({ _id: selectedWiki._id });
		$scope.selectedWiki.getWikiInfo();				
		$scope.selectedWiki.pages.sync();
		
		template.open('main', 'list-wiki-pages');
	}

	$scope.openSelectedWiki = function(selectedWiki){
		$scope.selectedWiki = selectedWiki;
		selectedWiki.getMainPage(function(result){
            template.open('main', 'view-wiki-page');
        });
	}
	
	$scope.openSelectedPage = function(wikiId, pageId){
    	$scope.selectedWiki = new Wiki({ _id: wikiId});
    	$scope.selectedWiki.getWikiInfo();
    	$scope.selectedWiki.findPage(pageId, function(result){
            window.location.href = '/wiki#/view/' + wikiId + '/' + pageId;
        });
	}
		
	$scope.newPage = function(){
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
            $scope.template.open('main', 'list-wiki-pages');
        });
	};
	
	
	$scope.wikis = model.wikis;
	$scope.titleOfNewWiki = "Titre";
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
