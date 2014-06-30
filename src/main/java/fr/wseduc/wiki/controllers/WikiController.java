package fr.wseduc.wiki.controllers;


import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.vertx.java.core.http.HttpServerRequest;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.SecuredAction;

public class WikiController extends MongoDbControllerHelper {

	public WikiController(String collection) {
		super(collection);
	}

	@Get("")
	@ApiDoc("Get HTML view")
	@SecuredAction("wiki.view")
	public void view(HttpServerRequest request) {
		renderView(request);
	}
	
	// TODO : définir les securedAction associées au wiki et ajouter les annotations
	// TODO : ajouter des resourceFilter
	@Get("/list/:filter")
	@ApiDoc("List all wikis")
	public void list(HttpServerRequest request) {
		super.list(request);
	}
	
	@Get("/:id")
	@ApiDoc("Get wiki by id")
	public void get(HttpServerRequest request) {
		retrieve(request);
	}
	
	@Post("")
	@ApiDoc("Add wiki")
	public void add(HttpServerRequest request) {
		create(request);
	}

	@Put("/:id")
	@ApiDoc("Update wiki by id")
	public void update(HttpServerRequest request) {
		super.update(request);
	}
	
	@Delete("/:id")
	@ApiDoc("Delete wiki by id")
	public void delete(HttpServerRequest request) {
		super.delete(request);
	}
		
}
