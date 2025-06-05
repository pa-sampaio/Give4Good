package com.criticalsoftware.announcements;

import jakarta.validation.constraints.NotBlank;

public class AnnouncementRequest {

    @NotBlank
    private String userDonorId;

    @NotBlank
    private String productName;

    @NotBlank
    private String productDescription;

    @NotBlank
    private String productPhotoUrl;

    @NotBlank
    private String productCategory;

    private String status;

    // getters e setters

    public String getUserDonorId() {
        return userDonorId;
    }

    public void setUserDonorId(String userDonorId) {
        this.userDonorId = userDonorId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public String getProductPhotoUrl() {
        return productPhotoUrl;
    }

    public void setProductPhotoUrl(String productPhotoUrl) {
        this.productPhotoUrl = productPhotoUrl;
    }

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public void setStatus(String status) { this.status = status; } public String getStatus() { return status; }
}