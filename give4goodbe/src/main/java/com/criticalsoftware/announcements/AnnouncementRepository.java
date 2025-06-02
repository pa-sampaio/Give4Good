package com.criticalsoftware.announcements;

import io.quarkus.mongodb.panache.PanacheMongoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@ApplicationScoped
public class AnnouncementRepository implements PanacheMongoRepository<Announcement> {

    public Announcement findAnnouncementById(ObjectId id) {
        return find("_id", id).firstResult();
    }

    public List<Announcement> findByDonorId(String donorId) {
        return list("userDonorId", donorId);
    }

    public List<Announcement> findByDoneeId(String doneeId) {
        return list("userDoneeId", doneeId);
    }

    public List<Announcement> findByDonorAndDoneeId(String donorId, String doneeId) {
        return list("userDonorId = ?1 and userDoneeId = ?2", donorId, doneeId);
    }

    public List<Announcement> findByClaimedFalse() {
        return list("claimed", false);
    }

    public List<Announcement> findUnclaimedNotOwnedByDonor(String donorId) {
        return list("userDonorId != ?1 and userDoneeId is null", donorId);
    }

    public List<Announcement> findNotOwnedByDonor(String donorId) {
        return list("userDonorId != ?1", donorId);
    }

    /**
     * Pesquisa por anúncios não reclamados e não criados pelo donorId,
     * filtrando por nome ou descrição do produto (case-insensitive).
     * Usa os campos corretos: product.name e product.description
     */
    public List<Announcement> findUnclaimedNotOwnedByDonorWithSearch(String donorId, String search) {
        if (search == null || search.isBlank()) {
            return findUnclaimedNotOwnedByDonor(donorId);
        }
        // Regex: encontra o termo em qualquer lugar, case-insensitive
        Pattern regex = Pattern.compile(".*" + Pattern.quote(search.trim()) + ".*", Pattern.CASE_INSENSITIVE);

        List<Document> orConditions = new ArrayList<>();
        orConditions.add(new Document("product.name", regex));
        orConditions.add(new Document("product.description", regex));

        Document query = new Document();
        query.append("userDonorId", new Document("$ne", donorId));
        query.append("userDoneeId", null);
        query.append("$or", orConditions);

        return list(query);
    }

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

        announcement.setUserDoneeId(null);
        return Response.noContent().build();
    }
}