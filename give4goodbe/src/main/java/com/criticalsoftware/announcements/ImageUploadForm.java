package com.criticalsoftware.announcements;

import org.jboss.resteasy.annotations.providers.multipart.PartType;
import jakarta.ws.rs.FormParam;

public class ImageUploadForm {
    @FormParam("image")
    @PartType("application/octet-stream")
    public byte[] image;

    @FormParam("fileName")
    @PartType("text/plain")
    public String fileName;
}