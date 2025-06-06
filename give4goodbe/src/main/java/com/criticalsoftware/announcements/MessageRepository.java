package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class MessageRepository implements PanacheMongoRepository<Message> {
    public List<Message> findByAnnouncementId(String announcementId) {
        return list("announcementId", announcementId);
    }
}