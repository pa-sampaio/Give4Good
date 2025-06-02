package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Announcement extends PanacheMongoEntity {

    private Product product;
    private LocalDateTime date;
    private String userDonorId;
    private String userDoneeId;

    public Announcement(Product product, String userDonorId) {
        this.product = product;
        this.date = LocalDateTime.now();
        this.userDonorId = userDonorId;
        this.userDoneeId = null;
    }
}