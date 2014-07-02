function Wiki() {

}


model.build = function() {
	this.makeModels([ Wiki ]);

	this.collection(Wiki, {
		sync : function() {
			var that = this;
			http().get('/wiki/list').done(function(data) {
				that.addRange(data);
			});
		}

	})
};
