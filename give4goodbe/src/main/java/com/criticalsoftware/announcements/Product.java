package com.criticalsoftware.announcements;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Product {

    @NotBlank(message = "Product name is mandatory")
    @Size(max = 30, message = "Product name must be at most 30 characters")
    private String name;

    @NotBlank(message = "Product description is mandatory")
    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @NotBlank(message = "Photo URL is mandatory")
    private String photoUrl;

    @NotBlank(message = "Category is mandatory")
    @Size(max = 255, message = "Category must be at most 255 characters")
    private String category;
}