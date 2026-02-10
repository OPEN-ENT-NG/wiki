package net.atos.entng.wiki.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import net.atos.entng.wiki.models.poll.Poll;
import net.atos.entng.wiki.models.poll.Vote;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Date;

@RunWith(VertxUnitRunner.class)
public class MongoDateDeserializerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testDeserializePollWithMongoDate(TestContext context) throws Exception {
        String json = "{"
                + "\"_id\": \"poll123\","
                + "\"name\": \"Test Poll\","
                + "\"description\": \"This is a test poll\","
                + "\"created\": { \"$date\": \"2023-10-25T10:15:30Z\" },"
                + "\"modified\": { \"$date\": 1698230400000 },"
                + "\"authorId\": \"author123\","
                + "\"authorName\": \"John Doe\","
                + "\"authorEmail\": \"john.doe@example.com\","
                + "\"votes\": []"
                + "}";

        Poll poll = objectMapper.readValue(json, Poll.class);

        context.assertNotNull(poll);

        context.assertEquals("poll123", poll.get_id());
        context.assertEquals("Test Poll", poll.getName());
        context.assertEquals("This is a test poll", poll.getDescription());

        context.assertNotNull(poll.getCreated());
        context.assertEquals(Date.from(java.time.Instant.parse("2023-10-25T10:15:30Z")), poll.getCreated());

        context.assertNotNull(poll.getModified());
        context.assertEquals(new Date(1698230400000L), poll.getModified());

    }

    @Test
    public void testDeserializeVoteWithMongoDate(TestContext context) throws Exception {
        String json = "{"
                + "\"vote\": \"YES\","
                + "\"userId\": \"user123\","
                + "\"userName\": \"Jane Doe\","
                + "\"userEmail\": \"jane.doe@example.com\","
                + "\"created\": { \"$date\": \"2023-10-20T08:00:00Z\" },"
                + "\"modified\": { \"$date\": 1697808000000 }"
                + "}";

        Vote vote = objectMapper.readValue(json, Vote.class);

        context.assertNotNull(vote);

        context.assertEquals("YES", vote.getVote());
        context.assertEquals("user123", vote.getUserId());
        context.assertEquals("Jane Doe", vote.getUserName());
        context.assertEquals("jane.doe@example.com", vote.getUserEmail());

        context.assertNotNull(vote.getCreated());
        context.assertEquals(Date.from(java.time.Instant.parse("2023-10-20T08:00:00Z")), vote.getCreated());

        context.assertNotNull(vote.getModified());
        context.assertEquals(new Date(1697808000000L), vote.getModified());
    }
}
