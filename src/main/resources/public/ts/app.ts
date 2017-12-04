import { routes, ng, model } from 'entcore';
import { build } from './model';
import { controller } from './controller';

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

ng.controllers.push(controller);
model.build = build;