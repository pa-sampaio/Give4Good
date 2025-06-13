package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Announcement extends PanacheMongoEntity {

    private Product product;
    private LocalDateTime date;
    private String userDonorId;
    private String userDoneeId;
    private List<ClaimRequest> claimRequests = new ArrayList<>();
    private String status = "available";
    private List<String> chatStartedWith = new ArrayList<>(); // <-- NOVO

    public Announcement(Product product, String userDonorId) {
        this.product = product;
        this.date = LocalDateTime.now();
        this.userDonorId = userDonorId;
        this.userDoneeId = null;
        this.claimRequests = new ArrayList<>();
        this.status ="available";
        this.chatStartedWith = new ArrayList<>();
    }
}