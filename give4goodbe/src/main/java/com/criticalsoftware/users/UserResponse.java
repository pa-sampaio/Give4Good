package com.criticalsoftware.users;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserResponse {
    private ObjectId id;
    private String name;
    private LocalDate dateBirth;
    private Contact contact;
    private String role;
}