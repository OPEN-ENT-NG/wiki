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


function WikiController($scope, template, model, route, $location, $route){
	var Wiki = Behaviours.applicationsBehaviours.wiki.namespace.Wiki;
	var Page = Behaviours.applicationsBehaviours.wiki.namespace.Page;
	var Version = Behaviours.applicationsBehaviours.wiki.namespace.Version;

	// Parse queries, e.g. param1=value1&param2=value2&paramN=valueN
    var parseQuery = function(queryString) {
        var params = {}, temp, i;
        var queries = queryString.split("&");

        for (i=0; i<queries.length; i++) {
             // Split into key/value pairs
            temp = queries[i].split('=');
            params[temp[0]] = temp[1];
        }

        return params;
    };

	$scope.moment = moment;
	$scope.template = template;
	$scope.display = {showPanel: false, showPanelForCurrentWiki: false};
	$scope.wiki = new Wiki();
	$scope.applicationName = lang.translate('wiki.title');
	$scope.notFound = false;
	$scope.me = model.me;
	$scope.searchbar = {};

	$scope.getWikiById = function(pWikiId) {
		return _.find(model.wikis.all, function(wiki){
			return wiki._id === pWikiId;
		});
	};

	$scope.isCreatingOrEditing = function(){
		return (template.contains('main', 'create-wiki') ||
				template.contains('main', 'edit-wiki') ||
				template.contains('main', 'create-page') ||
				template.contains('main', 'edit-page'));
	};

	// Functions to check rights
	$scope.canCreatePage = function(wiki){
	    return Behaviours.applicationsBehaviours.wiki.namespace.canCreatePage(wiki);
	};

	$scope.canCreatePageInAtLeastOneWiki = function(){
		return _.some(model.wikis.all, function(wiki){
			return $scope.canCreatePage(wiki);
		});
	};

	$scope.canManageWiki = function(wiki){
		return (wiki.myRights.edit !== undefined ||
				wiki.myRights.deleteWiki !== undefined ||
				wiki.myRights.share !== undefined);
	};


	var updateSearchBar = function() {
		return Behaviours.applicationsBehaviours.wiki.namespace.updateSearchBar($scope);
	};
	updateSearchBar();


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
				$scope.selectedWiki = $scope.getWikiById(params.wikiId);
				$scope.selectedWiki.pages.sync(function(){
					$scope.selectedWiki.setLastPages();
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
	                var parameters = parseQuery(queryString);
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
	template.open('side-panel', 'side-panel');
	template.open('commentForm', 'comment-page');

	// Date functions
    $scope.formatDate = function(dateObject){
    	return Behaviours.applicationsBehaviours.wiki.namespace.formatDate(dateObject);
    };

    $scope.getDateAndTime = function(dateObject) {
    	return Behaviours.applicationsBehaviours.wiki.namespace.getDateAndTime(dateObject);
    };

    $scope.getRelativeTimeFromDate = function(dateObject){
    	return Behaviours.applicationsBehaviours.wiki.namespace.getRelativeTimeFromDate(dateObject);
    };

	// Functions to check field "title"
	var titleIsEmpty = function(title) {
		return Behaviours.applicationsBehaviours.wiki.namespace.titleIsEmpty(title);
	};

	var wikiTitleExists = function(pTitle, pWikiId) {
		if(!pWikiId) {
			// when creating a wiki
			return _.find(model.wikis.all, function(wiki){
				return pTitle.trim() === wiki.title.trim() &&
				model.me.userId === wiki.owner.userId;
			});
		}
		else {
			//when updating a wiki
			return _.find(model.wikis.all, function(wiki){
				return (pTitle.trim() === wiki.title.trim() &&
						model.me.userId === wiki.owner.userId &&
						wiki._id !== pWikiId);
			});
		}
	};

	var pageTitleExists = function(pTitle, pWiki, pPageId) {
		return Behaviours.applicationsBehaviours.wiki.namespace.pageTitleExists(pTitle, pWiki, pPageId);
	};


	// Functions on wikis
	$scope.deleteWikiSelection = function(){
		_.map($scope.wikis.selection(), function(wikiToRemove){
			wikiToRemove.deleteWiki( function(){
				// Update search bar, without any server call
				$scope.searchbar.allpageslist = _.filter($scope.searchbar.allpageslist, function(page){
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
		if (titleIsEmpty($scope.wiki.title)){
			notify.error('wiki.form.title.is.empty');
			return;
		}
		if(wikiTitleExists($scope.wiki.title)){
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
		if (titleIsEmpty($scope.wiki.title)){
			notify.error('wiki.form.title.is.empty');
			return;
		}
		if(wikiTitleExists($scope.wiki.title, $scope.wiki._id)){
			notify.error('wiki.editform.titlealreadyexist.error');
			return;
		}

		var data = {
				title : $scope.wiki.title,
				thumbnail : $scope.wiki.thumbnail,
		};
		$scope.wiki.updateWiki(data, function(){
			updateSearchBar();
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
		$scope.selectedWiki = $scope.getWikiById(wikiId);
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
				$scope.selectedWiki.setLastPages();
				template.open('main', 'list-wiki-pages');
	        });
		}
	};


	// Functions on wiki pages
	$scope.listPages = function(wikiId){
		$location.path('/view/' + $scope.selectedWiki._id + '/list-pages');
		$route.reload();
	};

	$scope.redirect = function(path){
		$location.path(path);
	}

	$scope.redirectToHome = function () {
	    window.location.href = '/wiki';
	}

	$scope.openPageFromSearchbar = function(wikiId, pageId) {
		window.location.hash = '/view/' + wikiId + '/' + pageId;
	};

	$scope.openSelectedPage = function(wikiId, pageId){
    	$scope.selectedWiki = $scope.getWikiById(wikiId);
    	if(!$scope.selectedWiki) {
    		$scope.notFound = true;
    		return;
    	}

		$scope.selectedWiki.pages.sync(function(){
			$scope.selectedWiki.setLastPages();
			template.open('main', 'view-page');
			$scope.selectedWiki.getPage(
				pageId,
				function(result){
					$scope.$apply();
				},
				function(){
					$scope.notFound = true;
                    $scope.$apply();
				}
			);
		});
	};

	$scope.newPage = function(){
		$scope.page = new Page();
		template.open('main', 'create-page');
	};

	$scope.cancelCreatePage = function(pWiki){
		$scope.selectedWiki = $scope.getWikiById(pWiki._id);
		if($scope.selectedWiki.index && pWiki.page && pWiki.index === pWiki.page._id) {
			// Open index if it exists
			template.open('main', 'view-page');
		}
		else { // List pages
			template.open('main', 'list-wiki-pages');
		}
	};

	$scope.page = new Page();

	$scope.createPage = function(){
		if (titleIsEmpty($scope.page.title)){
			notify.error('wiki.form.title.is.empty');
			return;
		}
		if(pageTitleExists($scope.page.title, $scope.selectedWiki)){
			notify.error('wiki.page.form.titlealreadyexist.error');
			return;
		}

		template.open('main', 'view-page');

		var data = {
			title : $scope.page.title,
			content : $scope.page.content,
			isIndex : $scope.page.isIndex
		};
		$scope.selectedWiki.createPage(data, function(result){
			updateSearchBar();

			$scope.selectedWiki.pages.sync(function(){
				$scope.selectedWiki.setLastPages();
		        $scope.selectedWiki.getPage(result._id, function(returnedWiki){
					window.location.hash = '/view/' + $scope.selectedWiki._id + '/' + result._id;
		        });
			});
        });
	};

	$scope.editPage = function(selectedWiki) {
		$scope.selectedWiki.editedPage = new Page();
		$scope.selectedWiki.editedPage.updateData(selectedWiki.page);
		$scope.selectedWiki.editedPage.isIndex = ($scope.selectedWiki.editedPage._id === $scope.selectedWiki.index);
		$scope.selectedWiki.editedPage.wasIndex = (selectedWiki.page._id === $scope.selectedWiki.index);
		template.open('main', 'edit-page');
	};

	$scope.cancelEditPage = function(selectedWiki) {
        template.open('main', 'view-page');
	};

	$scope.updatePage = function(){
		// Check field "title"
		if (titleIsEmpty($scope.selectedWiki.editedPage.title)){
			notify.error('wiki.form.title.is.empty');
			return;
		}
		if(pageTitleExists($scope.selectedWiki.editedPage.title, $scope.selectedWiki, $scope.selectedWiki.editedPage._id)){
			notify.error('wiki.page.form.titlealreadyexist.error');
			return;
		}

		$scope.selectedWiki.page = $scope.selectedWiki.editedPage;
		template.open('main', 'view-page');

		$scope.selectedWiki.editedPage.save(function(result){
			updateSearchBar();

			$scope.selectedWiki.pages.sync(function(){
				$scope.selectedWiki.setLastPages();
				$scope.selectedWiki.getPage($scope.selectedWiki.page._id, function(returnedWiki){
					window.location.hash = '/view/' + $scope.selectedWiki._id + '/' + $scope.selectedWiki.page._id;
                    model.wikis.one('sync', function(){
        		    	$scope.openSelectedPage($scope.selectedWiki._id, $scope.selectedWiki.page._id);
        			});
        			model.wikis.sync();
				});
			});
		});
	};

	$scope.removeSelectedPages = function(){
		$scope.selectedWiki.pages.selection().forEach(function(page){
			$scope.selectedWiki.deletePage(page._id, function(result){
				updateSearchBar();
				$scope.listPages($scope.selectedWiki._id);
			});
		});
		$scope.display.showConfirmDelete = false;
	};

	$scope.deletePage = function(){
		$scope.selectedWiki.deletePage($scope.selectedWiki.page._id, function(result){
			updateSearchBar();
			window.location.hash = '/view/' + $scope.selectedWiki._id;
			$scope.listPages($scope.selectedWiki._id);
        });
	};

	$scope.showDuplicatePageForm = function(page) {
		var content;
		function copyPageContent(){
			$scope.wikiDuplicate = {};
			$scope.wikiDuplicate.page = new Page({
				title : '',
				content : content,
				isIndex : false
			});
			template.open('main', 'duplicate-page');
			$scope.$apply();
		}

		if(page){
			$scope.selectedWiki.getPage(page._id, function(result){
				content = _.findWhere(result.pages, { _id: page._id }).content;
				copyPageContent();
			});
		}
		else{
			content = $scope.selectedWiki.page.content;
			copyPageContent();
		}
	};

	$scope.duplicatePage = function() {
		return Behaviours.applicationsBehaviours.wiki.namespace.duplicatePage($scope, $scope.selectedWiki);
	};

	$scope.cancelDuplicatePage = function() {
		template.open('main', 'view-page');
	};


	$scope.showCommentForm = function() {
		return Behaviours.applicationsBehaviours.wiki.namespace.showCommentForm($scope.selectedWiki);
	};

	$scope.hideCommentForm = function() {
		return Behaviours.applicationsBehaviours.wiki.namespace.hideCommentForm($scope.selectedWiki);
	};

	$scope.switchCommentsDisplay = function() {
		return Behaviours.applicationsBehaviours.wiki.namespace.switchCommentsDisplay($scope.selectedWiki);
	};

	$scope.commentPage = function() {
		return Behaviours.applicationsBehaviours.wiki.namespace.commentPage($scope.selectedWiki, $scope);
	};

	$scope.removeComment = function(commentId, commentIndex) {
		return Behaviours.applicationsBehaviours.wiki.namespace.removeComment($scope.selectedWiki, commentId, commentIndex, $scope);
	};


	// Functions on versions (revisions) of a wiki page
	$scope.viewPageVersions = function(page){
		$scope.selectedWiki.page = page;
		return Behaviours.applicationsBehaviours.wiki.namespace.listVersions($scope.selectedWiki, $scope);
	};

	$scope.listVersions = function(){
		return Behaviours.applicationsBehaviours.wiki.namespace.listVersions($scope.selectedWiki, $scope);
	};

	$scope.restoreVersion = function(version){
		return Behaviours.applicationsBehaviours.wiki.namespace.restoreVersion(version, $scope.selectedWiki);
	};

	$scope.showVersion = function(version){
		return Behaviours.applicationsBehaviours.wiki.namespace.showVersion(version, $scope);
	};

	$scope.compareVersions = function(){
		return Behaviours.applicationsBehaviours.wiki.namespace.compareVersions($scope.selectedWiki, $scope);
	};

	$scope.wikis = model.wikis;
	$scope.selectedWiki = "";

	model.on("wikis.change", function(){
		$scope.$apply("wikis");
	});

}
