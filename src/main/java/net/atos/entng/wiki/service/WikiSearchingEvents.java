package net.atos.entng.wiki.service;

import com.mongodb.DBObject;
import com.mongodb.QueryBuilder;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Either.Right;
import fr.wseduc.webutils.I18n;
import org.entcore.common.search.SearchingEvents;
import org.entcore.common.service.VisibilityFilter;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.*;
import java.util.regex.Pattern;

import static org.entcore.common.mongodb.MongoDbResult.validResults;

public class WikiSearchingEvents implements SearchingEvents {

	private static final Logger log = LoggerFactory.getLogger(WikiSearchingEvents.class);
	private final MongoDb mongo;
	private final String collection;
	private static final I18n i18n = I18n.getInstance();

	public WikiSearchingEvents(String collection) {
		this.collection = collection;
		this.mongo = MongoDb.getInstance();
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

			final List<String> searchFieldsInPages = new ArrayList<String>();
			searchFieldsInPages.add("title");
			searchFieldsInPages.add("content");

			final int skip = (0 == page) ? -1 : page * limit;
			final List<String> groupAndUserids = groupIds.toList();
			final List<String> searchWordsLst = searchWords.toList();
			final List<DBObject> groups = new ArrayList<DBObject>();

			groups.add(QueryBuilder.start("userId").is(userId).get());
			for (String gpId: groupAndUserids) {
				groups.add(QueryBuilder.start("groupId").is(gpId).get());
			}

			//search on main title
			final String title = "title";
			final List<DBObject> listMainTitleField = new ArrayList<DBObject>();
			//search on pages
			final Map<String,List<DBObject>> fieldsMap = new HashMap<String, List<DBObject>>();

			for (String field : searchFieldsInPages) {
				final List<DBObject> elemsMatch = new ArrayList<DBObject>();
				for (String word : searchWordsLst) {
					final DBObject dbObject = QueryBuilder.start(field).regex(Pattern.compile(".*" +
							word + ".*", Pattern.CASE_INSENSITIVE)).get();
					elemsMatch.add(QueryBuilder.start("pages").elemMatch(dbObject).get());
					if (title.equals(field)) {
						listMainTitleField.add(dbObject);
					}
				}
				fieldsMap.put(field, elemsMatch);
			}

			final QueryBuilder worldsOrQuery = new QueryBuilder();
			worldsOrQuery.or(new QueryBuilder().and(listMainTitleField.toArray(new DBObject[listMainTitleField.size()])).get());

			for (final List<DBObject> field : fieldsMap.values()) {
				worldsOrQuery.or(new QueryBuilder().and(field.toArray(new DBObject[field.size()])).get());
			}

			final QueryBuilder rightsOrQuery = new QueryBuilder().or(
					QueryBuilder.start("visibility").is(VisibilityFilter.PUBLIC.name()).get(),
					QueryBuilder.start("visibility").is(VisibilityFilter.PROTECTED.name()).get(),
					QueryBuilder.start("owner.userId").is(userId).get(),
					QueryBuilder.start("shared").elemMatch(
							new QueryBuilder().or(groups.toArray(new DBObject[groups.size()])).get()
					).get());

			final QueryBuilder query = new QueryBuilder().and(worldsOrQuery.get(),rightsOrQuery.get());

			JsonObject sort = new JsonObject().putNumber("modified", -1);
			final JsonObject projection = new JsonObject();
			for (String field : returnFields) {
				projection.putNumber(field, 1);
			}

			mongo.find(collection, MongoQueryBuilder.build(query), sort,
					projection, skip, limit, Integer.MAX_VALUE, new Handler<Message<JsonObject>>() {
						@Override
						public void handle(Message<JsonObject> event) {
							final Either<String, JsonArray> ei = validResults(event);
							if (ei.isRight()) {
								final JsonArray res = formatSearchResult(ei.right().getValue(), columnsHeader, searchWordsLst, locale);
								handler.handle(new Right<String, JsonArray>(res));
							} else {
								handler.handle(new Either.Left<String, JsonArray>(ei.left().getValue()));
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
		final List<String> aHeader = columnsHeader.toList();
		final JsonArray traity = new JsonArray();

		for (int i=0;i<results.size();i++) {
			final JsonObject j = results.get(i);
			final JsonObject jr = new JsonObject();
			if (j != null) {
				final String wikiId = j.getString("_id");
				final Map<String, Object> map = formatDescription(j.getArray("pages", new JsonArray()),
						words, j.getObject("modified"), wikiId, locale);
				jr.putString(aHeader.get(0), j.getString("title"));
				jr.putString(aHeader.get(1), map.get("description").toString());
				jr.putObject(aHeader.get(2), (JsonObject) map.get("modified"));
				jr.putString(aHeader.get(3), j.getObject("owner").getString("displayName"));
				jr.putString(aHeader.get(4), j.getObject("owner").getString("userId"));
				jr.putString(aHeader.get(5), "/wiki#/view/" + wikiId);
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

		//get the last modified page that match with searched words for create the description
		for(int i=0;i<ja.size();i++) {
			final JsonObject jO = ja.get(i);
			final String title = jO.getString("title" ,"");
			final String content = jO.getString("content", "");
			final Date currentDate = MongoDb.parseIsoDate(jO.getObject("modified"));
			boolean match = false;
			for (final String word : words) {
				if (title.toLowerCase().contains(word.toLowerCase()) ||
						content.toLowerCase().contains(word.toLowerCase())) {
					match = true;
					break;
				}
			}
			if (countMatchPage == 0 && match) {
				titleRes = "<a href=\"/wiki#/view/" + wikiId + "/" + jO.getString("_id") + "\">" + title + "</a>";
				modifiedRes = jO.getObject("modified");
			} else if (countMatchPage > 0 && modifiedMarker.before(currentDate)) {
				titleRes = "<a href=\"/wiki#/view/" + wikiId + "/" + jO.getString("_id") + "\">" + title + "</a>";
				modifiedMarker = currentDate;
				modifiedRes = jO.getObject("modified");
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
			map.put("description", i18n.translate("wiki.search.description.one", locale, titleRes));
		} else {
			map.put("modified", modifiedRes);
			map.put("description", i18n.translate("wiki.search.description.several", locale,
					countMatchPage.toString(), titleRes));
		}

		return  map;
	}
}
