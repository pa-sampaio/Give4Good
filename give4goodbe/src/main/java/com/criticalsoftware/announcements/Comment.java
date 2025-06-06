package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends PanacheMongoEntity {
    private String announcementId;
    private String userId;
    private String username;
    private String content;
    private LocalDateTime createdAt;
}