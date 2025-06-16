package com.criticalsoftware.users;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@MongoEntity(collection = "users")
public class User extends PanacheMongoEntity {

    private String name;
    private LocalDate dateBirth;
    private Contact contact;
    private String password;
    private String resetCode;
    private String verificationCode;
    private boolean emailConfirmed;

    public User(String name, LocalDate dateBirth, Contact contact, String password, String verificationCode) {
        this.name = name;
        this.dateBirth = dateBirth;
        this.contact = contact;
        this.password = password;
        this.verificationCode = verificationCode;
        this.emailConfirmed = false;
    }
}