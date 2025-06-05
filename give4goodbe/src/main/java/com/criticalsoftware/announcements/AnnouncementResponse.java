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
public class AnnouncementResponse {
    private String id;
    private Product product;
    private String userDonorId;
    private String userDoneeId;
    private LocalDateTime date;
    private String status;

    public AnnouncementResponse(String id, Product product, String userDonorId, LocalDateTime date) {
        this.id = id;
        this.product = product;
        this.userDonorId = userDonorId;
        this.date = date;
        this.status = status;
    }
}
