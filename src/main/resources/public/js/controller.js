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
		wiki.content = $scope.contentOfNewWiki;
		model.wikis.push(wiki);
		var data = {
				title : wiki.title,
				content : wiki.content
		};
		http().postJson('/wiki', data);

		$scope.titleOfNewWiki = "";
		$scope.contentOfNewWiki = "";
	};

	$scope.openSelectedWiki = function(selectedWiki){
		console.log("test dmt : selectedWiki");
		$scope.selectedWiki = selectedWiki;
		$scope.divToShow = 'selected_wiki_content';
		template.open('main', 'view-wiki-page');
	}
	
	$scope.displayWikiList = function(){
		$scope.divToShow = 'wiki_list';
	}
	
	$scope.wikis = model.wikis;
	$scope.titleOfNewWiki = "Titre";
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
