package com.criticalsoftware.announcements;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.io.File;
import java.nio.file.Files;

@Path("/uploads")
public class ImageResource {

    @GET
    @Path("{fileName}")
    public Response getImage(@PathParam("fileName") String fileName) {
        try {
            File file = new File("uploads", fileName);
            if (!file.exists()) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }

            String mimeType = Files.probeContentType(file.toPath());
            if (mimeType == null) mimeType = "application/octet-stream";

            return Response.ok(file, mimeType).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
}