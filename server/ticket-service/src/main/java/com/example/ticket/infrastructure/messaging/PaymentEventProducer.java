package com.example.ticket.infrastructure.messaging;

import com.example.ticket.infrastructure.config.KafkaConfig;
import com.example.ticket.presentation.dto.event.PaymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentEvent(PaymentEvent event) {
        log.info("Publishing payment event to Kafka: {}", event);
        kafkaTemplate.send(KafkaConfig.PAYMENT_EVENTS_TOPIC, String.valueOf(event.getTicketId()), event);
    }
}
