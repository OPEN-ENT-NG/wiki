function Wiki() {

}


model.build = function() {
	this.makeModels([ Wiki ]);

	this.collection(Wiki, {
		sync : function() {
			var that = this;
			// TODO : gestion des droits
			http().get('/wiki/list/ALL').done(function(data) {
				that.addRange(data);
			});
		}

	})
};
