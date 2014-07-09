Behaviours.register('wiki', {
	// Used by component "linker", to create hypertext links between wiki pages
	search : function(searchText, callback) {
		http().get('/wiki/listallpages').done(
				function(wikis) {
	
					var pagesArray = _.map(
							wikis, 
							function(wiki) {
								var pages = wiki.pages;
								
								// Keep pages whose title contain searchText, or whose id equals searchText
								pages = _.filter(pages, function(page) {
									return lang.removeAccents(page.title.toLowerCase())
											.indexOf(
													lang.removeAccents(searchText)
															.toLowerCase()) !== -1
											|| page._id === searchText;
								});
								
								pages = _.map(pages, function(page) {
									return {
										title : page.title + ' [' + wiki.title + ']',
										ownerName : wiki.owner.displayName,
										owner : wiki.owner.userId,
										icon : '/img/icons/unknown-large.png', // TODO : à modifier
										path : '/wiki#/view/' + wiki._id + '/' + page._id,
										id : page._id
									}
								});
								
								return pages;
							}
						);
					pagesArray = _.flatten(pagesArray);
						
					callback(pagesArray);
				})
	}
});