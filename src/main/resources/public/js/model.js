model.build = function() {
	// variable "namespace", stored in behaviours, contains the model objects
	var namespace = Behaviours.applicationsBehaviours.wiki.namespace;

	this.makeModels(namespace);

	this.collection(namespace.Wiki, {
		sync : '/wiki/list',
		behaviours: 'wiki'
	});
};
