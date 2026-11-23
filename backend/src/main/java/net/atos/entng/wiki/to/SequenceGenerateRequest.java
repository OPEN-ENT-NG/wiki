package net.atos.entng.wiki.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.edifice.aiwiki.v1.LearningObjective;
import io.vertx.core.json.JsonObject;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SequenceGenerateRequest {
    private final String wikiId;
    private final String schoolType;
    private final String level;
    private final String subject;
    private final String content;
    private final int seanceCount;
    private final int seanceDuration;
    private final List<LearningObjective> objectives;
    private final String priorKnowledge;
    private final String hook;
    private final String difficulties;
    private final String inclusion;
    private final String jobFamily;

    @JsonCreator
    public SequenceGenerateRequest(
        @JsonProperty("wikiId") String wikiId,
        @JsonProperty("schoolType") String schoolType,
        @JsonProperty("level") String level,
        @JsonProperty("subject") String subject,
        @JsonProperty("content") String content,
        @JsonProperty("seanceCount") int seanceCount,
        @JsonProperty("seanceDuration") int seanceDuration,
        @JsonProperty("objectives") List<LearningObjective> objectives,
        @JsonProperty("priorKnowledge") String priorKnowledge,
        @JsonProperty("hook") String hook,
        @JsonProperty("difficulties") String difficulties,
        @JsonProperty("inclusion") String inclusion,
        @JsonProperty("jobFamily") String jobFamily) {
        this.wikiId = wikiId;
        this.schoolType = schoolType;
        this.level = level;
        this.subject = subject;
        this.content = content;
        this.seanceCount = seanceCount;
        this.seanceDuration = seanceDuration;
        this.objectives = objectives;
        this.priorKnowledge = priorKnowledge;
        this.hook = hook;
        this.difficulties = difficulties;
        this.inclusion = inclusion;
        this.jobFamily = jobFamily;
    }

    public String getWikiId() {
        return wikiId;
    }

    public String getSchoolType() {
        return schoolType;
    }

    public String getLevel() {
        return level;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public int getSeanceCount() {
        return seanceCount;
    }

    public int getSeanceDuration() {
        return seanceDuration;
    }

    public List<LearningObjective> getObjectives() {
        return objectives;
    }

    public String getPriorKnowledge() {
        return priorKnowledge;
    }

    public String getHook() {
        return hook;
    }

    public String getDifficulties() {
        return difficulties;
    }

    public String getInclusion() {
        return inclusion;
    }

    public String getJobFamily() {
        return jobFamily;
    }

    public static SequenceGenerateRequest fromJson(final JsonObject json) {
        return json.mapTo(SequenceGenerateRequest.class);
    }
}
