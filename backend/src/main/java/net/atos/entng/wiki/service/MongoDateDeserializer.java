package net.atos.entng.wiki.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.time.Instant;
import java.util.Date;

/**
 * Custom deserializer to handle MongoDB date formats, which can be either ISO strings or timestamps.
 * This deserializer checks for the presence of the "$date" field and parses it accordingly.
 * It supports both ISO 8601 string format and Unix timestamp format for dates.
 * Example of supported formats:
 * - {"$date": "2024-06-01T12:00:00Z"} (ISO 8601 string)
 * - {"$date": 1712131200000} (Unix timestamp in milliseconds)
 * This deserializer ensures that date fields in MongoDB documents are correctly converted to Java Date objects during deserialization.
 * It can be used in conjunction with Jackson's ObjectMapper to automatically handle date fields when mapping MongoDB documents to Java objects.
 * To use this deserializer, you can annotate the date fields in your Java classes with @JsonDeserialize(using = MongoDateDeserializer.class).
 * For example:
 * @JsonDeserialize(using = MongoDateDeserializer.class)
 * private Date createdAt;
 * This will ensure that when Jackson deserializes JSON data containing date fields, it will use the MongoDateDeserializer to correctly parse the date values from MongoDB's format.
 * Overall, this custom deserializer provides a robust solution for handling MongoDB date formats in Java applications that use Jackson for JSON processing.
 * It abstracts away the complexities of dealing with different date formats and allows developers to work with Java Date objects seamlessly when interacting with MongoDB data.
 */
public class MongoDateDeserializer extends JsonDeserializer<Date> {
    @Override
    public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node.has("$date")) {
            JsonNode dateNode = node.get("$date");
            if (dateNode.isTextual()) {
                return Date.from(Instant.parse(dateNode.asText()));
            } else if (dateNode.isLong()) {
                return new Date(dateNode.asLong());
            }
        }
        return null;
    }
}