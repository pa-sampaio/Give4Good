package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class CommentRepository implements PanacheMongoRepository<Comment> {

    public List<Comment> findByAnnouncementId(String announcementId) {
        return list("announcementId", announcementId);
    }
}