package com.criticalsoftware.announcements;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ClaimRequest {
    private String userId;
    private String username;
    private String reason;
    private LocalDateTime date;
    private boolean selected = false;
}