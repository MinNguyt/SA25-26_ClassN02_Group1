package com.example.ticket.application;

import com.example.ticket.domain.model.Payment;
import com.example.ticket.domain.model.PaymentStatus;
import com.example.ticket.domain.model.Ticket;
import com.example.ticket.domain.model.TicketStatus;
import com.example.ticket.domain.repository.PaymentRepository;
import com.example.ticket.domain.repository.TicketRepository;
import com.example.ticket.infrastructure.messaging.PaymentEventProducer;
import com.example.ticket.presentation.dto.SePayWebhookDTO;
import com.example.ticket.presentation.dto.event.PaymentEvent;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final PaymentEventProducer paymentEventProducer;

    @Transactional
    public void processSePayWebhook(SePayWebhookDTO payload) {
        log.info("Processing SePay webhook for SePay ID: {}", payload.getId());

        // Check if payment already processed
        Optional<Payment> existingPayment = paymentRepository.findBySepayId(payload.getId());
        if (existingPayment.isPresent()) {
            log.info("Payment already processed for SePay ID: {}", payload.getId());
            return;
        }

        // Parse ticket ID
        Integer ticketId = extractTicketId(payload.getContent());
        if (ticketId == null) {
            log.error("Could not extract ticket ID from content: {}", payload.getContent());
            return;
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        Payment payment = Payment.builder()
                .ticket(ticket)
                .sepayId(payload.getId())
                .gateway(payload.getGateway())
                // .transactionDate(...) // Parse if needed
                .accountNumber(payload.getAccountNumber())
                .code(payload.getCode())
                .content(payload.getContent())
                .transferType(payload.getTransferType())
                .transferAmount(payload.getTransferAmount())
                .accumulated(payload.getAccumulated())
                .subAccount(payload.getSubAccount())
                .referenceCode(payload.getReferenceCode())
                .description(payload.getDescription())
                .status(PaymentStatus.COMPLETED) // Assume success if webhook received
                .build();

        paymentRepository.save(payment);

        // Determine if payment is successful/sufficient
        PaymentStatus eventStatus = PaymentStatus.FAILED;
        if (ticket.getTotalPrice().compareTo(payload.getTransferAmount()) <= 0) {
            eventStatus = PaymentStatus.COMPLETED;
        } else {
            log.warn("Payment amount {} is less than ticket price {} for ticket {}",
                    payload.getTransferAmount(), ticket.getTotalPrice(), ticketId);
        }

        // Publish event to Kafka
        PaymentEvent event = PaymentEvent.builder()
                .sepayId(payload.getId())
                .ticketId(ticketId)
                .status(eventStatus)
                .amount(payload.getTransferAmount())
                .content(payload.getContent())
                .description(payload.getDescription())
                .build();

        paymentEventProducer.sendPaymentEvent(event);
    }

    private Integer extractTicketId(String content) {
        // Simple regex extraction for "TICKET 123" or similar patterns users might type
        try {
            // This is a placeholder logic. You need a reliable way to link payment to
            // ticket.
            // Maybe use a unique code generated at booking time?
            return Integer.parseInt(content.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return null;
        }
    }
}
