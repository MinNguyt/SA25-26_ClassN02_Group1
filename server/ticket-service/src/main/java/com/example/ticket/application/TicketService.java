package com.example.ticket.application;

import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.presentation.dto.PaginatedResponse;
import com.example.ticket.presentation.dto.TicketCreateDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.ticket.domain.model.PaymentStatus;
import com.example.ticket.infrastructure.messaging.NotificationProducer;
import com.example.ticket.infrastructure.service.RedisLockService;
import com.example.ticket.presentation.dto.event.NotificationMessage;
import com.example.ticket.presentation.dto.event.PaymentEvent;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final RedisLockService redisLockService;
    private final NotificationProducer notificationProducer;
    // Inject PaymentRepository if needed for event handling, or use ticket.payment
    // relation

    @Transactional
    public Ticket createTicket(TicketCreateDTO dto, Integer userId) {
        log.info("Creating ticket for user {} schedule {} seat {}", userId, dto.getSchedule_id(), dto.getSeat_id());

        // 1. Acquire Redis Lock (5 min TTL)
        boolean locked = redisLockService.tryLock(dto.getSchedule_id(), dto.getSeat_id(), 5);
        if (!locked) {
            throw new RuntimeException("Seat is currently locked by another user. Please try again later.");
        }

        // 2. Check DB for booked status (double check)
        if (ticketRepository.findByScheduleIdAndSeatId(dto.getSchedule_id(), dto.getSeat_id()).isPresent()) {
            // If already booked implies lock was for a new booking that finished, or just
            // concurrency race
            redisLockService.releaseLock(dto.getSchedule_id(), dto.getSeat_id());
            throw new RuntimeException("Seat already booked");
        }

        try {
            Ticket ticket = Ticket.builder()
                    .userId(userId)
                    .scheduleId(dto.getSchedule_id())
                    .seatId(dto.getSeat_id())
                    .totalPrice(dto.getPrice())
                    .status(TicketStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            return ticketRepository.save(ticket);
        } catch (Exception e) {
            // Release lock if DB save fails
            redisLockService.releaseLock(dto.getSchedule_id(), dto.getSeat_id());
            throw e;
        }
    }

    @Transactional
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Handling payment event for ticket: {}", event.getTicketId());

        Ticket ticket = getTicket(event.getTicketId());

        if (event.getStatus() == PaymentStatus.COMPLETED) {
            ticket.setStatus(TicketStatus.BOOKED);
            ticketRepository.save(ticket);

            // Release lock finally
            redisLockService.releaseLock(ticket.getScheduleId(), ticket.getSeatId());

            // Send Notification
            NotificationMessage msg = NotificationMessage.builder()
                    .userId(String.valueOf(ticket.getUserId()))
                    .type("TICKET_BOOKED")
                    .title("Booking Confirmed")
                    .message("Your ticket #" + ticket.getId() + " has been confirmed.")
                    .payload(ticket)
                    .build();
            notificationProducer.sendNotification(msg);

        } else {
            ticket.setStatus(TicketStatus.CANCELLED);
            ticket.setCancelReason("Payment Failed: " + event.getDescription());
            ticketRepository.save(ticket);

            // Release lock to free seat
            redisLockService.releaseLock(ticket.getScheduleId(), ticket.getSeatId());
        }
    }

    public Ticket getTicket(Integer id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getUserTickets(Integer userId) {
        return ticketRepository.findByUserId(userId);
    }

    public PaginatedResponse<Ticket> getAllTickets(int page, int limit, TicketStatus status) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Ticket> ticketPage;

        if (status != null) {
            ticketPage = ticketRepository.findByStatus(status, pageRequest);
        } else {
            ticketPage = ticketRepository.findAll(pageRequest);
        }

        return PaginatedResponse.<Ticket>builder()
                .results(ticketPage.getContent())
                .total(ticketPage.getTotalElements())
                .page(page)
                .limit(limit)
                .build();
    }

    @Transactional
    public Ticket updateTicket(Integer id, Ticket updates) {
        Ticket ticket = getTicket(id);

        if (updates.getStatus() != null) {
            ticket.setStatus(updates.getStatus());
        }

        if (updates.getCancelReason() != null) {
            ticket.setCancelReason(updates.getCancelReason());
        }

        // Add more fields to update as needed

        return ticketRepository.save(ticket);
    }
}
