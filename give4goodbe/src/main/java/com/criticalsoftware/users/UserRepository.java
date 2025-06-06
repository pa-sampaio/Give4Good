package com.criticalsoftware.users;

import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.bson.types.ObjectId;

@ApplicationScoped
public class UserRepository implements PanacheMongoRepository<User> {

    public User findByEmail(String email) {
        return find("contact.email", email).firstResult();
    }

    public User findById(String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            return find("_id", objectId).firstResult();
        } catch (IllegalArgumentException e) {
            // Handle the exception (e.g., log the error, throw a new exception, etc.)
            return null;
        }
    }
}