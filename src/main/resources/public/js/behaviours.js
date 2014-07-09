Behaviours.register('wiki', {
	// Used by component "linker", to create hypertext links between wiki pages
	search : function(searchText, callback) {
		http().get('/wiki/listallpages').done(
				function(pages) {
					callback(_.map(_.filter(pages, function(page) {
						return lang.removeAccents(page.title.toLowerCase())
								.indexOf(
										lang.removeAccents(searchText)
												.toLowerCase()) !== -1
								|| page._id === searchText;
					}), function(page) {
						return {
							title : '[' + page.wiki_title + '] ' +page.title,
							// TODO : à modifier. Valeurs temporaires pour tester
							ownerName : 'owner',
							owner : 'ownerId',
							icon : '/img/icons/unknown-large.png',
							path : '/wiki#/view/' + page.wiki_id + '/' + page._id,
							id : page._id
						};
					}));
				})
	}
});