package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import org.bson.codecs.pojo.annotations.BsonProperty;
import java.time.LocalDateTime;

public class Message extends PanacheMongoEntity {
    @BsonProperty("announcementId")
    public String announcementId;
    @BsonProperty("senderId")
    public String senderId;
    @BsonProperty("receiverId")
    public String receiverId;
    @BsonProperty("content")
    public String content;
    @BsonProperty("timestamp")
    public LocalDateTime timestamp;
    @BsonProperty("senderName")
    public String senderName;
}