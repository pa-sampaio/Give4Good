package com.criticalsoftware.announcements;

import com.criticalsoftware.users.User;
import com.criticalsoftware.users.UserRepository;
import jakarta.inject.Inject;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.bson.types.ObjectId;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@Path("/announcements")
@Produces("application/json")
public class AnnouncementResource {

    private static final String ID_REGEX = "[a-fA-F0-9]{24}";
    private static final String INVALID_ID_FORMAT = "Invalid ID format.";
    private static final String REQUEST_ERROR = "Error processing the request: ";

    @Inject
    AnnouncementRepository announcementRepository;

    @Inject
    AnnouncementService announcementService;

    @Inject
    UserRepository userRepository;

    @Inject
    CommentRepository commentRepository;

    @Inject
    MessageRepository messageRepository;

    private boolean isInvalidId(String id) {
        return !id.matches(ID_REGEX);
    }

    private boolean isProductFieldsEmpty(AnnouncementRequest request) {
        return request.getProductName() == null || request.getProductName().isBlank() ||
                request.getProductDescription() == null || request.getProductDescription().isBlank() ||
                request.getProductPhotoUrl() == null || request.getProductPhotoUrl().isBlank() ||
                request.getProductCategory() == null || request.getProductCategory().isBlank();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid AnnouncementRequest request) {
        try {
            if (isProductFieldsEmpty(request)) {
                return Response.status(Response.Status.BAD_REQUEST).entity("All product fields must be filled.").build();
            }

            ObjectId donorId = new ObjectId(request.getUserDonorId());
            User donor = userRepository.findById(donorId);
            if (donor == null) {
                return Response.status(Response.Status.NOT_FOUND).entity("Donor not found.").build();
            }

            Product product = new Product(
                    request.getProductName(),
                    request.getProductDescription(),
                    request.getProductPhotoUrl(),
                    request.getProductCategory()
            );

            Announcement announcement = new Announcement(product, donor.id.toString());
            announcementRepository.persist(announcement);

            AnnouncementResponse response = announcementService.mapToResponse(announcement);

            return Response.created(new URI("/announcements/" + announcement.id)).entity(Map.of(
                    "message", "Announcement created successfully.",
                    "announcement", response
            )).build();

        } catch (ConstraintViolationException e) {
            String errors = e.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST).entity("Validation error: " + errors).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    @POST
    @Path("/upload-image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadImage(@MultipartForm ImageUploadForm form, @Context UriInfo uriInfo) {
        try {
            java.nio.file.Path uploadFolder = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadFolder))
                java.nio.file.Files.createDirectories(uploadFolder);

            // Get file extension
            String extension = ".jpg";
            if (form.fileName != null && form.fileName.contains(".")) {
                extension = form.fileName.substring(form.fileName.lastIndexOf('.'));
            }
            String newFileName = UUID.randomUUID() + extension;
            java.nio.file.Path filePath = uploadFolder.resolve(newFileName);

            java.nio.file.Files.write(filePath, form.image);

            // Generate URL (adjust as needed)
            String serverUrl = uriInfo.getBaseUri().toString().replaceAll("/$", "");
            String url = serverUrl + "/uploads/" + newFileName;

            return Response.ok().entity(Map.of("url", url)).build();
        } catch (Exception e) {
            return Response.serverError().entity(Map.of("error", "Image upload failed: " + e.getMessage())).build();
        }
    }

    @GET
    @Path("/categories")
    public Response getAllCategories() {
        List<Announcement> list = announcementRepository.listAll();
        Set<String> categories = list.stream()
                .map(a -> a.getProduct() != null ? a.getProduct().getCategory() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(TreeSet::new));
        return Response.ok(categories).build();
    }

    @PUT
    @Path("/{id:" + ID_REGEX + "}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("id") String id, @Valid AnnouncementRequest request) {
        try {
            Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
            if (announcement == null) return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();

            if (isProductFieldsEmpty(request)) {
                return Response.status(Response.Status.BAD_REQUEST).entity("All product fields must be filled.").build();
            }

            announcement.setProduct(new Product(
                    request.getProductName(),
                    request.getProductDescription(),
                    request.getProductPhotoUrl(),
                    request.getProductCategory()
            ));

            announcementRepository.persistOrUpdate(announcement);
            return Response.ok(announcementService.mapToResponse(announcement)).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error updating announcement.").build();
        }
    }

    @PUT
    @Path("/{id:" + ID_REGEX + "}/undo-claim")
    public Response undoClaim(@PathParam("id") String id) {
        return announcementRepository.undoClaim(id);
    }

    // ===== CLAIM REQUESTS =====

    public static class ClaimRequestDTO {
        public String userId;
        public String reason;
    }

    @POST
    @Path("/{id:" + ID_REGEX + "}/claim")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addClaimRequest(@PathParam("id") String id, ClaimRequestDTO dto) {
        if (dto == null || dto.userId == null || dto.reason == null || dto.reason.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("userId and reason required.").build();
        }
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        }

        boolean alreadyRequested = announcement.getClaimRequests().stream()
                .anyMatch(req -> req.getUserId().equals(dto.userId));
        if (alreadyRequested) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Já fizeste um pedido para este anúncio.").build();
        }

        String username = "User";
        User user = null;
        try {
            user = userRepository.findById(new ObjectId(dto.userId));
        } catch (Exception ignored) {}
        if (user != null && user.getName() != null) {
            username = user.getName();
        }

        ClaimRequest request = new ClaimRequest(
                dto.userId,
                username,
                dto.reason,
                java.time.LocalDateTime.now(),
                false
        );

        announcement.getClaimRequests().add(request);
        announcement.setStatus("claimed");
        announcementRepository.persistOrUpdate(announcement);

        return Response.status(Response.Status.CREATED).entity(request).build();
    }

    @GET
    @Path("/{id:" + ID_REGEX + "}/claim-requests")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listClaimRequests(@PathParam("id") String id) {
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        }
        return Response.ok(announcement.getClaimRequests()).build();
    }

    public static class SelectClaimDTO {
        public String userId;
    }

    @PUT
    @Path("/{id:" + ID_REGEX + "}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateStatus(@PathParam("id") String id, Map<String, String> body) {
        String status = body.get("status");
        if (status == null || (!status.equals("available") && !status.equals("sent") && !status.equals("unavailable"))) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid status.").build();
        }
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        }
        announcement.setStatus(status);
        announcementRepository.persistOrUpdate(announcement);
        return Response.ok(announcementService.mapToResponse(announcement)).build();
    }

    @PUT
    @Path("/{id:" + ID_REGEX + "}/select-claim")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response selectClaim(@PathParam("id") String id, SelectClaimDTO dto) {
        if (dto == null || dto.userId == null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("userId required.").build();
        }
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        }
        List<ClaimRequest> requests = announcement.getClaimRequests();
        boolean found = false;
        for (ClaimRequest req : requests) {
            if (req.getUserId().equals(dto.userId)) {
                req.setSelected(true);
                announcement.setUserDoneeId(req.getUserId());
                found = true;
            } else {
                req.setSelected(false);
            }
        }
        if (!found) {
            return Response.status(Response.Status.BAD_REQUEST).entity("ClaimRequest not found for this user.").build();
        }
        announcementRepository.persistOrUpdate(announcement);
        return Response.ok(announcement).build();
    }

    // ===== END CLAIM REQUESTS =====

    // ===== MENSAGENS (CHAT) =====

    public static class MessageDTO {
        public String senderId;
        public String receiverId;
        public String content;
        public String senderName;
    }

    @POST
    @Path("/{id:" + ID_REGEX + "}/messages")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response postMessage(@PathParam("id") String announcementId, MessageDTO dto) {
        if (dto == null || dto.senderId == null || dto.receiverId == null || dto.content == null || dto.content.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("senderId, receiverId e content obrigatórios.").build();
        }
        Message msg = new Message();
        msg.announcementId = announcementId;
        msg.senderId = dto.senderId;
        msg.receiverId = dto.receiverId;
        msg.content = dto.content;
        msg.senderName = dto.senderName;
        msg.timestamp = java.time.LocalDateTime.now();
        messageRepository.persist(msg);
        return Response.status(Response.Status.CREATED).entity(msg).build();
    }

    @GET
    @Path("/{id:" + ID_REGEX + "}/messages")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listMessages(@PathParam("id") String announcementId) {
        var msgs = messageRepository.findByAnnouncementId(announcementId);
        msgs.sort(Comparator.comparing(m -> m.timestamp));
        return Response.ok(msgs).build();
    }

    // ===== END MENSAGENS =====

    // NOVO: Endpoint para donor iniciar chat com candidate (chatStartedWith)
    @POST
    @Path("/{id:" + ID_REGEX + "}/start-chat")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response startChatWithDonee(@PathParam("id") String id, Map<String, String> body) {
        String doneeId = body.get("doneeId");
        if (doneeId == null || doneeId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).entity("doneeId is required.").build();
        }
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        }
        if (announcement.getChatStartedWith() == null) {
            announcement.setChatStartedWith(new ArrayList<>());
        }
        if (!announcement.getChatStartedWith().contains(doneeId)) {
            announcement.getChatStartedWith().add(doneeId);
            announcementRepository.persistOrUpdate(announcement);
        }
        return Response.ok().entity(Map.of("message", "Chat started with candidate.")).build();
    }

    @PUT
    @Path("/{announcementId:" + ID_REGEX + "}/userDonee/{userId:" + ID_REGEX + "}")
    public Response updateUserDonee(@PathParam("announcementId") String announcementId, @PathParam("userId") String userId) {
        try {
            Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(announcementId));
            if (announcement == null) {
                return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
            }

            User userDonee = userRepository.findById(new ObjectId(userId));
            if (userDonee == null) {
                return Response.status(Response.Status.NOT_FOUND).entity("User (donee) not found.").build();
            }

            announcement.setUserDoneeId(userId);
            announcementRepository.persistOrUpdate(announcement);

            User userDonor = userRepository.findById(new ObjectId(announcement.getUserDonorId()));
            if (userDonor != null && userDonor.getContact() != null && userDonor.getContact().getEmail() != null) {
                String donorEmail = userDonor.getContact().getEmail();
                String donorName = userDonor.getName() != null ? userDonor.getName() : "Utilizador Give4Good";
                String doneeName = userDonee.getName() != null ? userDonee.getName() : "Utilizador Give4Good";
                String doneeEmail = (userDonee.getContact() != null && userDonee.getContact().getEmail() != null)
                        ? userDonee.getContact().getEmail()
                        : "Não disponível";
                String doneePhone = (userDonee.getContact() != null && userDonee.getContact().getPhoneNumber() != null)
                        ? String.valueOf(userDonee.getContact().getPhoneNumber())
                        : "Não disponível";
                String subject = "Give4Good - Your announcement has been claimed!";
                String body = "Hello " + donorName + ",\n\n"
                        + "Your announcement \"" + announcement.getProduct().getName() + "\" has been claimed by:\n"
                        + "Name: " + doneeName + "\n"
                        + "Email: " + doneeEmail + "\n"
                        + "Phone: " + doneePhone + "\n\n"
                        + "Please contact the user to arrange the delivery!\n\n"
                        + "Best regards,\nThe Give4Good Team";
                try {
                    com.criticalsoftware.users.EmailSender.sendEmail(donorEmail, subject, body);
                } catch (Exception e) {
                    // Log error if needed
                }
            }

            return Response.ok().entity(Map.of(
                    "message", "Donee updated successfully.",
                    "announcement", announcementService.mapToResponse(announcement)
            )).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id:" + ID_REGEX + "}")
    public Response delete(@PathParam("id") String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            if (!announcementRepository.deleteById(objectId)) {
                return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
            }

            return Response.noContent().build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error deleting announcement.").build();
        }
    }

    // GET BY ID
    @GET
    @Path("/{id:" + ID_REGEX + "}")
    public Response getById(@PathParam("id") String id) {
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();
        // Garante claimRequests nunca nulo
        announcement.getClaimRequests();
        return Response.ok(announcementService.mapToResponse(announcement)).build();
    }

    // ALL ANNOUNCEMENTS
    @GET
    public Response getAll() {
        List<Announcement> list = announcementRepository.listAll();
        // Garante claimRequests nunca nulo
        for (Announcement a : list) a.getClaimRequests();
        return Response.ok(
                list.stream().map(announcementService::mapToResponse).collect(Collectors.toList())
        ).build();
    }

    @GET
    @Path("/donor/{donorId:" + ID_REGEX + "}")
    public Response getByDonorId(@PathParam("donorId") String donorId) {
        try {
            return Response.ok(announcementService.getAnnouncementsByDonorId(donorId)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    // ALTERADO: agora retorna todos os anúncios onde o donee foi selecionado ou teve chat iniciado
    @GET
    @Path("/donee/{doneeId:" + ID_REGEX + "}")
    public Response getByDoneeId(@PathParam("doneeId") String doneeId) {
        try {
            return Response.ok(announcementService.getAnnouncementsWithChatForDonee(doneeId)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    @GET
    @Path("/donor/{donorId:" + ID_REGEX + "}/donee/{doneeId:" + ID_REGEX + "}")
    public Response getByDonorAndDoneeId(@PathParam("donorId") String donorId, @PathParam("doneeId") String doneeId) {
        try {
            return Response.ok(announcementService.getAnnouncementsByDonorAndDoneeId(donorId, doneeId)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    @GET
    @Path("/unclaimed")
    public Response getUnclaimedAnnouncements() {
        try {
            return Response.ok(announcementService.getUnclaimedAnnouncements()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    @GET
    @Path("/unclaimed/not-owned-by/{donorId:" + ID_REGEX + "}")
    public Response getUnclaimedAnnouncementsNotOwnedBy(
            @PathParam("donorId") String donorId,
            @QueryParam("search") String search,
            @QueryParam("category") String category
    ) {
        try {
            return Response.ok(
                    announcementService.getUnclaimedAnnouncementsNotOwnedByDonorWithSearchAndCategory(donorId, search, category)
            ).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    @GET
    @Path("/not-owned-by/{donorId:" + ID_REGEX + "}")
    public Response getAnnouncementsNotOwnedBy(@PathParam("donorId") String donorId) {
        try {
            return Response.ok(announcementService.getAnnouncementsNotOwnedByDonor(donorId)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(REQUEST_ERROR + e.getMessage()).build();
        }
    }

    // ==== COMMENTS ENDPOINTS ====

    @GET
    @Path("/{id:" + ID_REGEX + "}/comments")
    public Response getComments(@PathParam("id") String id) {
        List<Comment> comments = commentRepository.findByAnnouncementId(id);
        comments.sort(Comparator.comparing(Comment::getCreatedAt));
        return Response.ok(comments).build();
    }

    @POST
    @Path("/{id:" + ID_REGEX + "}/comments")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addComment(@PathParam("id") String id, CommentRequest request) {
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Announcement not found.").build();
        }
        if (request.getContent() == null || request.getContent().isBlank() ||
                request.getUserId() == null || request.getUserId().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Both userId and content are required.").build();
        }

        String username = "User";
        User user = null;
        try {
            user = userRepository.findById(new ObjectId(request.getUserId()));
        } catch (Exception ignored) {}
        if (user != null && user.getName() != null) {
            username = user.getName();
        }

        Comment comment = new Comment(
                id,
                request.getUserId(),
                username,
                request.getContent(),
                java.time.LocalDateTime.now()
        );
        commentRepository.persist(comment);
        return Response.status(Response.Status.CREATED).entity(comment).build();
    }

    // ==== NOVO: Endpoint para anúncios que o usuário fez claim ====
    @GET
    @Path("/users/{userId}/claims")
    public Response getAnnouncementsUserClaimed(@PathParam("userId") String userId) {
        List<Announcement> allAnnouncements = announcementRepository.listAll();
        List<Announcement> claimedByUser = allAnnouncements.stream()
                .filter(announcement ->
                        announcement.getClaimRequests() != null &&
                                announcement.getClaimRequests().stream()
                                        .anyMatch(claim -> userId.equals(claim.getUserId()))
                )
                .collect(Collectors.toList());
        // Garante claimRequests não nulo
        claimedByUser.forEach(a -> a.getClaimRequests());
        return Response.ok(
                claimedByUser.stream().map(announcementService::mapToResponse).collect(Collectors.toList())
        ).build();
    }
}