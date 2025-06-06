package com.criticalsoftware.users;

import org.jboss.resteasy.annotations.providers.multipart.PartType;
import jakarta.ws.rs.FormParam;
import java.io.InputStream;

public class UserFormData {

    @FormParam("name")
    private String name;

    @FormParam("dateBirth")
    private String dateBirth; // String, depois converte para LocalDate

    @FormParam("password")
    private String password;

    @FormParam("address")
    private String address;

    @FormParam("phoneNumber")
    private String phoneNumber;

    @FormParam("email")
    private String email;

    @FormParam("image")
    @PartType("application/octet-stream")
    private InputStream image;

    // Getters e setters...
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDateBirth() { return dateBirth; }
    public void setDateBirth(String dateBirth) { this.dateBirth = dateBirth; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public InputStream getImage() { return image; }
    public void setImage(InputStream image) { this.image = image; }
}