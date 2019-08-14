import { model, ng, routes } from 'entcore';
import { build } from './model';
import { controller } from './controller';
import { LibraryResourceInformation, LibraryServiceProvider } from "entcore/types/src/ts/library/library.service";

interface Wiki {
    _id: string;
    thumbnail: string;
    title: string;
}

ng.configs.push(ng.config(['libraryServiceProvider', function (libraryServiceProvider: LibraryServiceProvider<Wiki>) {
    libraryServiceProvider.setPublishUrlGetterFromId(function (id: string) {
        return `/wiki/${id}/library`;
    });
    libraryServiceProvider.setInvokableResourceInformationGetterFromResource(function () {
        return function (resource: Wiki): { id: string, resourceInformation: LibraryResourceInformation } {
            return {id: resource._id, resourceInformation: {title: resource.title, cover: resource.thumbnail}};
        };
    });
}]));

routes.define(function ($routeProvider) {
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
