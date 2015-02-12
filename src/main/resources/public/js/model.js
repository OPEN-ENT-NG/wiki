var namespace = Behaviours.applicationsBehaviours.wiki.namespace;

model.build = function() {
	model.me.workflow.load(['wiki']);
	
	this.makeModels([ namespace.Wiki, namespace.Page, namespace.Version ]);

	this.collection(namespace.Wiki, {
		sync : '/wiki/list',
		behaviours: 'wiki'
	});
};