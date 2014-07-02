package fr.wseduc.wiki.controllers;

import java.util.Map;

import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.platform.Container;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.BaseController;

public class WikiController extends BaseController {

	private final WikiService wikiService;
	
	public WikiController(String collection) {
		wikiService = new WikiService(collection);
	}
	
	@Override
    public void init(Vertx vertx, Container container, RouteMatcher rm, Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions)
    {
		super.init(vertx, container, rm, securedActions);
		this.wikiService.init(vertx, container);
    }
	
	@Get("")
	@ApiDoc("Get HTML view")
	@SecuredAction("wiki.view")
	public void view(HttpServerRequest request) {
		renderView(request);
	}
	
	/* TODO : gestion des droits
	 	- définir les securedAction associées au wiki et ajouter les annotations
		- ajouter des resourceFilter
	 */
	
	@Get("/list")
	@ApiDoc("List wikis")
	public void listWikis(HttpServerRequest request) {
		wikiService.listWikis(request);
	}
	
	@Post("")
	@ApiDoc("Create wiki")
	public void createWiki(HttpServerRequest request) {
		wikiService.createWiki(request);
	}

	@Put("/:idwiki")
	@ApiDoc("Update wiki by id")
	public void updateWiki(HttpServerRequest request) {
		// TODO
	}
	
	@Delete("/:idwiki")
	@ApiDoc("Delete wiki by id")
	public void deleteWiki(HttpServerRequest request) {
		// TODO
	}
	
	
	@Get("/:idwiki/page")
	@ApiDoc("Get main page of a wiki")
	public void getMainPage(HttpServerRequest request) {
		wikiService.getMainPage(request);
	}
	
	@Get("/:idwiki/page/:idpage")
	@ApiDoc("Get a specific page of a wiki")
	public void getPage(HttpServerRequest request) {
		wikiService.getPage(request);
	}
	
	@Post("/:idwiki/page")
	@ApiDoc("Add page to wiki")
	public void createPage(HttpServerRequest request) {
		wikiService.createPage(request);
	}

	@Put("/:idwiki/page/:idpage")
	@ApiDoc("Update page by id")
	public void updatePage(HttpServerRequest request) {
		// TODO
	}
	
	@Delete("/:idwiki/page/:idpage")
	@ApiDoc("Delete page by id")
	public void deletePage(HttpServerRequest request) {
		// TODO
	}
}
