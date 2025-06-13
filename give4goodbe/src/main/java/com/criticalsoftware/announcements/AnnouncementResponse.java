package com.criticalsoftware.announcements;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AnnouncementResponse {
    private String id;
    private Product product;
    private String userDonorId;
    private String userDoneeId;
    private LocalDateTime date;
    private String status;
    private List<String> chatStartedWith;
}