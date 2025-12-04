package net.atos.entng.wiki.models.poll;

import org.entcore.common.user.UserInfos;

import java.util.Date;

public class Vote {
    private String vote;
    private String userId;
    private String userName;
    private String userEmail;
    private Date created;
    private Date modified;

    public Vote() {
    }

    public Vote(String vote, String userId, String userName, String userEmail) {
        this.vote = vote;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
    }

    public String getVote() {
        return vote;
    }
    public void setVote(String vote) {
        this.vote = vote;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public String getUserEmail() {
        return userEmail;
    }
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    public Date getCreated() {
        return created;
    }
    public void setCreated(Date created) {
        this.created = created;
    }
    public Date getModified() {
        return modified;
    }
    public void setModified(Date modified) {
        this.modified = modified;
    }
}
