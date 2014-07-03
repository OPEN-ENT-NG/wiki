package fr.wseduc.wiki.controllers;

import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.BaseController;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import fr.wseduc.wiki.service.WikiService;
import fr.wseduc.wiki.service.WikiServiceMongoImpl;

public class WikiController extends BaseController {

	private final WikiService wikiService;
	
	public WikiController(String collection) {
		wikiService = new WikiServiceMongoImpl(collection);
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
		Handler<Either<String, JsonArray>> handler = DefaultResponseHandler
				.arrayResponseHandler(request);
		
		wikiService.listWikis(handler);
	}
	
	@Post("")
	@ApiDoc("Create wiki")
	public void createWiki(final HttpServerRequest request) {
		
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
									.defaultResponseHandler(request);
							
							String wikiTitle = data.getString("title");
							if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
								Renders.badRequest(request);
								return;
							}
							
							wikiService.createWiki(user, wikiTitle, handler);
						}
					});
				} else {
					Renders.unauthorized(request);
				}
			}
		});
	}

	@Put("/:idwiki")
	@ApiDoc("Update wiki by id")
	public void updateWiki(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
									.defaultResponseHandler(request);
							
							String idWiki = request.params().get("idwiki");
							
							String wikiTitle = data.getString("title");
							if (wikiTitle == null || wikiTitle.trim().isEmpty()) {
								Renders.badRequest(request);
								return;
							}
							
							wikiService.updateWiki(user, idWiki, wikiTitle, handler);
						}
					});
				} else {
					Renders.unauthorized(request);
				}
			}
		});
	}
	
	@Delete("/:idwiki")
	@ApiDoc("Delete wiki by id")
	public void deleteWiki(HttpServerRequest request) {
		// TODO
	}
	
	
	@Get("/:idwiki/page")
	@ApiDoc("Get main page of a wiki")
	public void getMainPage(HttpServerRequest request) {
		String idwiki = request.params().get("idwiki");
		Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
				.defaultResponseHandler(request);
		
		wikiService.getMainPage(idwiki, handler);
	}
	
	@Get("/:idwiki/page/:idpage")
	@ApiDoc("Get a specific page of a wiki")
	public void getPage(HttpServerRequest request) {
		String idWiki = request.params().get("idwiki");
		String idPage = request.params().get("idpage");
		
		Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
				.defaultResponseHandler(request);
		
		wikiService.getPage(idWiki, idPage, handler);
	}
	
	@Post("/:idwiki/page")
	@ApiDoc("Add page to wiki")
	public void createPage(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
									.defaultResponseHandler(request);
							
							String idWiki = request.params().get("idwiki");
							
							String pageTitle = data.getString("title");
							String pageContent = data.getString("content");
							if (pageTitle == null || pageTitle.trim().isEmpty() || pageContent == null || pageContent.trim().isEmpty()) {
								Renders.badRequest(request);
								return;
							}
							
							wikiService.createPage(user, idWiki, pageTitle, pageContent, handler);					
						}
					});
				} else {
					Renders.unauthorized(request);
				}
			}
		});
	}

	@Put("/:idwiki/page/:idpage")
	@ApiDoc("Update page by id")
	public void updatePage(final HttpServerRequest request) {		
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject data) {
							Handler<Either<String, JsonObject>> handler = DefaultResponseHandler
									.defaultResponseHandler(request);
							
							String idWiki = request.params().get("idwiki");
							String idPage = request.params().get("idpage");
							
							String pageTitle = data.getString("title");
							String pageContent = data.getString("content");
							if (pageTitle == null || pageTitle.trim().isEmpty() || pageContent == null || pageContent.trim().isEmpty()) {
								Renders.badRequest(request);
								return;
							}
							
							wikiService.updatePage(user, idWiki, idPage, pageTitle, pageContent, handler);					
						}
					});
				} else {
					Renders.unauthorized(request);
				}
			}
		});
	}
	
	@Delete("/:idwiki/page/:idpage")
	@ApiDoc("Delete page by id")
	public void deletePage(HttpServerRequest request) {
		// TODO
	}
}
