package com.criticalsoftware.announcements;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class AnnouncementService {

    @Inject
    AnnouncementRepository announcementRepository;

    public List<AnnouncementResponse> getAnnouncementsByDonorId(String donorId) {
        return announcementRepository.findByDonorId(donorId).stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getAnnouncementsByDoneeId(String doneeId) {
        return announcementRepository.findByDoneeId(doneeId).stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getAnnouncementsByDonorAndDoneeId(String donorId, String doneeId) {
        return announcementRepository.findByDonorAndDoneeId(donorId, doneeId).stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getUnclaimedAnnouncements() {
        return announcementRepository.findByClaimedFalse().stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getUnclaimedAnnouncementsNotOwnedByDonor(String donorId) {
        return announcementRepository.findUnclaimedNotOwnedByDonor(donorId).stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getUnclaimedAnnouncementsNotOwnedByDonorWithSearch(String donorId, String search) {
        return announcementRepository.findUnclaimedNotOwnedByDonorWithSearch(donorId, search).stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getUnclaimedAnnouncementsNotOwnedByDonorWithSearchAndCategory(
            String donorId, String search, String category) {
        return announcementRepository.findUnclaimedNotOwnedByDonorWithSearchAndCategory(donorId, search, category)
                .stream().map(this::mapToResponse).toList();
    }

    public List<AnnouncementResponse> getAnnouncementsNotOwnedByDonor(String donorId) {
        return announcementRepository.findNotOwnedByDonor(donorId).stream().map(this::mapToResponse).toList();
    }

    // Inclui chats iniciados
    public List<AnnouncementResponse> getAnnouncementsWithChatForDonee(String doneeId) {
        return announcementRepository.findAnnouncementsWithChatForDonee(doneeId)
                .stream().map(this::mapToResponse).toList();
    }

    public AnnouncementResponse mapToResponse(Announcement announcement) {
        return new AnnouncementResponse(
                announcement.id != null ? announcement.id.toString() : null,
                announcement.getProduct(),
                announcement.getUserDonorId(),
                announcement.getUserDoneeId(),
                announcement.getDate(),
                announcement.getStatus(),
                announcement.getChatStartedWith(),
                announcement.getClaimRequests() // <-- Inclua este campo!
        );
    }
}