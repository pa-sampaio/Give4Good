package com.criticalsoftware.users;

import jakarta.inject.Inject;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import org.bson.types.ObjectId;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Path("/users")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class UserResource {

    public static final String USER_NOT_FOUND = "User not found.";

    @Inject
    UserRepository repository;

    @POST
    public Response create(@Valid UserRequest userRequest) {
        try {
            if (repository.findByEmail(userRequest.getContact().getEmail()) != null) {
                return Response.status(Status.CONFLICT).entity("Email already in use").build();
            }

            String verificationCode = VerificationCodeGenerator.generateCode();

            User user = new User(
                    userRequest.getName(),
                    userRequest.getDateBirth(),
                    userRequest.getContact(),
                    userRequest.getPassword(),
                    verificationCode,
                    userRequest.getRole() // <-- ADICIONADO
            );

            repository.persist(user);

            String to = userRequest.getContact().getEmail();
            String subject = "Give4Good - Email Confirmation Code";
            String body = "Your confirmation code is: " + verificationCode;
            try {
                EmailSender.sendEmail(to, subject, body);
            } catch (Exception e) {
                return Response.status(Status.INTERNAL_SERVER_ERROR)
                        .entity("User created but failed to send confirmation email: " + e.getMessage())
                        .build();
            }

            return Response.created(new URI("/users/" + user.id))
                    .entity("User created successfully with ID: " + user.id)
                    .build();

        } catch (ConstraintViolationException e) {
            String errorMessages = e.getConstraintViolations().stream()
                    .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                    .collect(Collectors.joining(", "));
            return Response.status(Status.BAD_REQUEST).entity("Validation error: " + errorMessages).build();
        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating user: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/login")
    public Response login(UserLoginRequest loginRequest) {
        try {
            User user = repository.findByEmail(loginRequest.getEmail());

            if (user == null || !user.getPassword().equals(loginRequest.getPassword())) {
                return Response.status(Status.UNAUTHORIZED).entity("Invalid email or password").build();
            }

            UserResponse userResponse = new UserResponse(
                    user.id,
                    user.getName(),
                    user.getDateBirth(),
                    user.getContact(),
                    user.getRole()
            );

            return Response.ok(userResponse).build();

        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity("Error during login: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/confirm")
    public Response confirmEmail(CodeConfirmationRequest request) {
        try {
            User user = repository.findByEmail(request.getEmail());
            if (user == null) {
                return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
            }

            if (user.getVerificationCode() != null && user.getVerificationCode().equals(request.getCode())) {
                user.setEmailConfirmed(true);
                user.setVerificationCode(null);
                repository.update(user);
                return Response.ok("Email confirmed successfully").build();
            } else {
                return Response.status(Status.BAD_REQUEST).entity("Invalid confirmation code").build();
            }
        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity("Error confirming email: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/email/{email}")
    public Response getByEmail(@PathParam("email") String email) {
        User user = repository.findByEmail(email);
        if (user == null) {
            return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
        }
        UserResponse userResponse = new UserResponse(user.id, user.getName(), user.getDateBirth(), user.getContact(), user.getRole()); // <-- ADICIONADO
        return Response.ok(userResponse).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        if (id == null || !id.matches("^[0-9a-fA-F]{24}$")) {
            return Response.status(Status.BAD_REQUEST).entity("Invalid ID").build();
        }

        User user = repository.findById(new ObjectId(id));
        if (user == null) {
            return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
        }

        UserResponse userResponse = new UserResponse(user.id, user.getName(), user.getDateBirth(), user.getContact(), user.getRole()); // <-- ADICIONADO
        return Response.ok(userResponse).build();
    }

    @GET
    public Response getAll() {
        List<User> users = repository.listAll();
        List<UserResponse> userResponses = new ArrayList<>();
        for (User user : users) {
            userResponses.add(new UserResponse(user.id, user.getName(), user.getDateBirth(), user.getContact(), user.getRole())); // <-- ADICIONADO
        }
        return Response.ok(userResponses).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") String id, UserRequest userRequest) {
        try {
            ObjectId objectId = new ObjectId(id);
            User userFromDb = repository.findById(objectId);
            if (userFromDb == null) {
                return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
            }
            // Atualiza nome, data de nascimento, contacto e role
            userFromDb.setName(userRequest.getName());
            userFromDb.setDateBirth(userRequest.getDateBirth());
            userFromDb.setContact(userRequest.getContact());
            userFromDb.setRole(userRequest.getRole()); // <-- ADICIONADO
            repository.update(userFromDb);
            return Response.ok().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Status.BAD_REQUEST).entity("Invalid user ID").build();
        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR).entity("Error updating user: " + e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            User user = repository.findById(objectId);
            if (user == null) {
                return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
            }
            repository.delete(user);
            return Response.noContent().build();
        } catch (IllegalArgumentException e) {
            return Response.status(Status.BAD_REQUEST).entity("Invalid user ID").build();
        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR).entity("Error deleting user: " + e.getMessage()).build();
        }
    }

    @POST
    @Path("/reset-password/request")
    public Response requestResetPassword(EmailRequest emailRequest) {
        try {
            User user = repository.findByEmail(emailRequest.getEmail());
            if (user == null) {
                return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
            }

            String resetCode = VerificationCodeGenerator.generateCode();
            user.setResetCode(resetCode);
            repository.update(user);

            String subject = "Give4Good - Password Reset Code";
            String body = "Your password reset code is: " + resetCode;
            EmailSender.sendEmail(emailRequest.getEmail(), subject, body);

            return Response.ok("Password reset code sent to email").build();

        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity("Error sending password reset code: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/reset-password/confirm")
    public Response confirmResetCode(ResetCodeConfirmationRequest request) {
        try {
            User user = repository.findByEmail(request.getEmail());
            if (user == null) {
                return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
            }

            if (user.getResetCode() != null && user.getResetCode().equals(request.getCode())) {
                return Response.ok("Reset code confirmed").build();
            } else {
                return Response.status(Status.BAD_REQUEST).entity("Invalid reset code").build();
            }

        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity("Error confirming reset code: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Path("/reset-password")
    public Response resetPassword(ResetPasswordRequest request) {
        try {
            User user = repository.findByEmail(request.getEmail());
            if (user == null) {
                return Response.status(Status.NOT_FOUND).entity(USER_NOT_FOUND).build();
            }

            if (user.getResetCode() == null || !user.getResetCode().equals(request.getCode())) {
                return Response.status(Status.BAD_REQUEST).entity("Invalid or missing reset code").build();
            }

            user.setPassword(request.getNewPassword());
            user.setResetCode(null);
            repository.update(user);

            return Response.ok("Password reset successfully").build();

        } catch (Exception e) {
            return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity("Error resetting password: " + e.getMessage())
                    .build();
        }
    }

    public static class EmailRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetCodeConfirmationRequest {
        private String email;
        private String code;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class ResetPasswordRequest {
        private String email;
        private String code;
        private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}