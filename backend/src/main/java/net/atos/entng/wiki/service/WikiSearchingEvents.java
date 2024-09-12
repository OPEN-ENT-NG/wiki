/*
 * Copyright © Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package net.atos.entng.wiki.service;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Either.Right;
import fr.wseduc.webutils.I18n;
import org.entcore.common.search.SearchingEvents;
import org.entcore.common.service.SearchService;
import org.entcore.common.utils.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.*;

public class WikiSearchingEvents implements SearchingEvents {

	private static final Logger log = LoggerFactory.getLogger(WikiSearchingEvents.class);
	private final SearchService searchService;
	private static final I18n i18n = I18n.getInstance();

	public WikiSearchingEvents(SearchService searchService) {
		this.searchService = searchService;
	}

	@Override
	public void searchResource(List<String> appFilters, String userId, JsonArray groupIds, JsonArray searchWords, Integer page, Integer limit, final JsonArray columnsHeader,
							   final String locale, final Handler<Either<String, JsonArray>> handler) {
		if (appFilters.contains(WikiSearchingEvents.class.getSimpleName())) {
			final List<String> returnFields = new ArrayList<String>();
			returnFields.add("title");
			returnFields.add("modified");
			returnFields.add("owner.userId");
			returnFields.add("owner.displayName");
			returnFields.add("pages");

			final List<String> searchWordsLst = searchWords.getList();

			searchService.search(userId, groupIds.getList(), returnFields, searchWordsLst, page, limit, new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					if (event.isRight()) {
						final JsonArray res = formatSearchResult(event.right().getValue(), columnsHeader, searchWordsLst, locale);
						handler.handle(new Right<String, JsonArray>(res));
					} else {
						handler.handle(new Either.Left<String, JsonArray>(event.left().getValue()));
					}
					if (log.isDebugEnabled()) {
						log.debug("[WikiSearchingEvents][searchResource] The resources searched by user are finded");
					}
				}
			});
		} else {
			handler.handle(new Right<String, JsonArray>(new JsonArray()));
		}
	}

	private JsonArray formatSearchResult(final JsonArray results, final JsonArray columnsHeader, final List<String> words, final String locale) {
		final List<String> aHeader = columnsHeader.getList();
		final JsonArray traity = new JsonArray();

		for (int i=0;i<results.size();i++) {
			final JsonObject j = results.getJsonObject(i);
			final JsonObject jr = new JsonObject();
			if (j != null) {
				final String wikiId = j.getString("_id");
				final Map<String, Object> map = formatDescription(j.getJsonArray("pages", new JsonArray()),
						words, j.getJsonObject("modified"), wikiId, locale);
				jr.put(aHeader.get(0), j.getString("title"));
				jr.put(aHeader.get(1), map.get("description").toString());
				jr.put(aHeader.get(2), (JsonObject) map.get("modified"));
				jr.put(aHeader.get(3), j.getJsonObject("owner").getString("displayName"));
				jr.put(aHeader.get(4), j.getJsonObject("owner").getString("userId"));
				jr.put(aHeader.get(5), "/wiki/id/" + wikiId);
				traity.add(jr);
			}
		}
		return traity;
	}

	private Map<String, Object> formatDescription(JsonArray ja, final List<String> words, JsonObject defaultDate, String wikiId, String locale) {
		final Map<String, Object> map = new HashMap<String, Object>();

		Integer countMatchPage = 0;
		String titleRes = "";
		JsonObject modifiedRes = null;
		Date modifiedMarker = null;

		final List<String> unaccentWords = new ArrayList<String>();
		for (final String word : words) {
			unaccentWords.add(StringUtils.stripAccentsToLowerCase(word));
		}

		//get the last modified page that match with searched words for create the description
		for(int i=0;i<ja.size();i++) {
			final JsonObject jO = ja.getJsonObject(i);
			final String title = jO.getString("title" ,"");
			final String content = jO.getString("content", "");
			final Date currentDate = MongoDb.parseIsoDate(jO.getJsonObject("modified"));

			int matchTitle = unaccentWords.size();
			int matchContent = unaccentWords.size();
			for (final String word : unaccentWords) {
				if (StringUtils.stripAccentsToLowerCase(title).contains(word)) {
					matchTitle--;
				}
				if (StringUtils.stripAccentsToLowerCase(content).contains(word)) {
					matchContent--;
				}
			}
			final Boolean match = (matchTitle == 0 || matchContent == 0);
			if (countMatchPage == 0 && match) {
				titleRes = "<a href=\"/wiki/id/" + wikiId + "/" + jO.getString("_id") + "\">" + title + "</a>";
				modifiedRes = jO.getJsonObject("modified");
			} else if (countMatchPage > 0 && match && modifiedMarker.before(currentDate)) {
				titleRes = "<a href=\"/wiki/id/" + wikiId + "/" + jO.getString("_id") + "\">" + title + "</a>";
				modifiedMarker = currentDate;
				modifiedRes = jO.getJsonObject("modified");
			}
			if (match) {
				modifiedMarker = currentDate;
				countMatchPage++;
			}
		}

		if (countMatchPage == 0) {
			map.put("modified", defaultDate);
			map.put("description", "");
		} else if (countMatchPage == 1) {
			map.put("modified", modifiedRes);
			map.put("description", i18n.translate("wiki.search.description.one", i18n.DEFAULT_DOMAIN, locale, titleRes));
		} else {
			map.put("modified", modifiedRes);
			map.put("description", i18n.translate("wiki.search.description.several", i18n.DEFAULT_DOMAIN, locale,
					countMatchPage.toString(), titleRes));
		}

		return  map;
	}
}
