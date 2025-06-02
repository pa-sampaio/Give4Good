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

import java.io.IOException;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

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

            // Obtém extensão do arquivo
            String extension = ".jpg";
            if (form.fileName != null && form.fileName.contains(".")) {
                extension = form.fileName.substring(form.fileName.lastIndexOf('.'));
            }
            String newFileName = UUID.randomUUID() + extension;
            java.nio.file.Path filePath = uploadFolder.resolve(newFileName);

            java.nio.file.Files.write(filePath, form.image);

            // Gera URL (ajuste conforme necessário)
            String serverUrl = uriInfo.getBaseUri().toString().replaceAll("/$", "");
            String url = serverUrl + "/uploads/" + newFileName;

            return Response.ok().entity(Map.of("url", url)).build();
        } catch (Exception e) {
            return Response.serverError().entity(Map.of("error", "Image upload failed: " + e.getMessage())).build();
        }
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

    @GET
    @Path("/{id:" + ID_REGEX + "}")
    public Response getById(@PathParam("id") String id) {
        Announcement announcement = announcementRepository.findAnnouncementById(new ObjectId(id));
        if (announcement == null) return Response.status(Response.Status.NOT_FOUND).entity("Announcement not found.").build();

        return Response.ok(announcementService.mapToResponse(announcement)).build();
    }

    @GET
    public Response getAll() {
        return Response.ok(announcementRepository.listAll().stream()
                .map(announcementService::mapToResponse)
                .collect(Collectors.toList())).build();
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

    @GET
    @Path("/donee/{doneeId:" + ID_REGEX + "}")
    public Response getByDoneeId(@PathParam("doneeId") String doneeId) {
        try {
            return Response.ok(announcementService.getAnnouncementsByDoneeId(doneeId)).build();
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
    public Response getUnclaimedAnnouncementsNotOwnedBy(@PathParam("donorId") String donorId) {
        try {
            return Response.ok(announcementService.getUnclaimedAnnouncementsNotOwnedByDonor(donorId)).build();
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
}