function WikiController($scope, template){

	$scope.template = template;
	$scope.divToShow = 'wiki_list';
	
	$scope.deleteWiki = function(wikiToRemove){
		model.wikis.remove(wikiToRemove);
		http().delete('/wiki/' + wikiToRemove._id);
	};
	
	$scope.saveContent = function(){
		var wiki = new Wiki();
		wiki.title = $scope.titleOfNewWiki;
		
		var data = {
				title : wiki.title
		};
		http().postJson('/wiki', data).done(function(content){
			model.wikis.push(wiki);
			// TODO : mettre à jour model.wikis avec les donnees creees en base
		});

		$scope.titleOfNewWiki = "";
	};

	$scope.openSelectedWiki = function(selectedWiki){
		$scope.selectedWiki = selectedWiki;
		
		http().get('/wiki/' + selectedWiki._id + '/page').done(function(wiki){
			$scope.selectedWiki.pages = wiki.pages;
			$scope.divToShow = 'selected_wiki_content';
			$scope.template.open('main', 'view-wiki-page');
		});
	}
	
	$scope.displayWikiList = function(){
		$scope.divToShow = 'wiki_list';
	}
	
	$scope.listPages = function(){
		http().get('/wiki/list/' + $scope.selectedWiki._id).done(function(wikiArray){
			$scope.selectedWiki.pages = wikiArray[0].pages;
			$scope.divToShow = 'selected_wiki_pageslist';
		});
	}
	
	$scope.openSelectedPage = function(){
		// TODO
	}
	
	$scope.wikis = model.wikis;
	$scope.titleOfNewWiki = "Titre";
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
