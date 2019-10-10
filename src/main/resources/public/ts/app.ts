import { model, ng, routes } from 'entcore';
import { build } from './model';
import { controller } from './controller';
import { LibraryServiceProvider } from 'entcore/types/src/ts/library/library.service';
import { IdAndLibraryResourceInformation } from 'entcore/types/src/ts/library/library.types';

interface Wiki {
    _id: string;
    thumbnail: string;
    title: string;
}

ng.configs.push(ng.config(['libraryServiceProvider', function (libraryServiceProvider: LibraryServiceProvider<Blog>) {
    libraryServiceProvider.setInvokableResourceInformationGetterFromResource(function () {
        return function (resource: Wiki): IdAndLibraryResourceInformation {
            return {
                id: resource._id, 
                resourceInformation: {
                    title: resource.title, 
                    cover: resource.thumbnail,
                    application: "Wiki",
                    pdfUri: `/wiki/print?wiki=${resource._id}`
                }
            };
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
