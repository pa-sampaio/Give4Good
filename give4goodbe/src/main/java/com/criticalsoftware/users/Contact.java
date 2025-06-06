package com.criticalsoftware.users;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//User Contact
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Contact {
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email may not be blank")
    private String email;

    @NotNull(message = "PhoneNumber may not be blank")
    @Max(value = 999999999, message = "Phone number must be less than 10 digits")
    private Integer phoneNumber;

    @NotBlank(message = "Address may not be blank")
    private String address;
}