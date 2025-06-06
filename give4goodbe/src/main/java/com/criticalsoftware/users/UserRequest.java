package com.criticalsoftware.users;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// User Data Request
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserRequest {
    @NotBlank(message = "Name may not be blank")
    private String name;

    @NotNull(message = "Date Birth is mandatory")
    private LocalDate dateBirth;

    @Valid
    @NotNull(message = "Contact is mandatory")
    private Contact contact;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    private String photoUrl;

    @NotBlank(message = "Role is mandatory")
    private String role; // ADICIONADO

    public String getPhotoUrl() {
        return photoUrl;
    }
    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}