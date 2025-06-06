package com.criticalsoftware.users;

public class CodeConfirmationRequest {
    private String email;
    private String code;

    // Construtores (pode deixar vazio para frameworks de deserialização)
    public CodeConfirmationRequest() {}

    public CodeConfirmationRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }

    // Getters e setters
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
}
