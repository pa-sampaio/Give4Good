package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import org.bson.types.ObjectId;

import java.util.List;

/**
 * Repository for managing Announcement entities.
 */
@ApplicationScoped
public class AnnouncementRepository implements PanacheMongoRepository<Announcement> {

    /**
     * Finds an announcement by its MongoDB ObjectId.
     *
     * @param id The ObjectId of the announcement.
     * @return The Announcement if found, null otherwise.
     */
    public Announcement findAnnouncementById(ObjectId id) {
        return find("_id", id).firstResult();
    }

    /**
     * Finds all announcements created by a specific donor.
     */
    public List<Announcement> findByDonorId(String donorId) {
        return list("userDonorId", donorId);
    }

    /**
     * Finds all announcements claimed by a specific donee.
     */
    public List<Announcement> findByDoneeId(String doneeId) {
        return list("userDoneeId", doneeId);
    }

    /**
     * Finds all announcements with a specific donor and donee.
     */
    public List<Announcement> findByDonorAndDoneeId(String donorId, String doneeId) {
        return list("userDonorId = ?1 and userDoneeId = ?2", donorId, doneeId);
    }

    /**
     * Returns all announcements that have not been claimed yet.
     */
    public List<Announcement> findByClaimedFalse() {
        return list("claimed", false);
    }

    /**
     * Finds unclaimed announcements not created by a given donor.
     */
    public List<Announcement> findUnclaimedNotOwnedByDonor(String donorId) {
        return list("userDonorId != ?1 and userDoneeId is null", donorId);
    }

    /**
     * Finds all announcements not created by the given donor.
     */
    public List<Announcement> findNotOwnedByDonor(String donorId) {
        return list("userDonorId != ?1", donorId);
    }

    /**
     * Removes the claim (donee) from an announcement.
     *
     * @param id The string ID of the announcement.
     * @return A Response indicating success or error.
     */
    @Transactional
    public Response undoClaim(String id) {
        Announcement announcement = findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        }
        if (announcement.getUserDoneeId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Cannot remove donee as the announcement already has no donee.")
                    .build();
        }

        announcement.setUserDoneeId(null); // change is persisted automatically due to @Transactional
        return Response.noContent().build();
    }
}