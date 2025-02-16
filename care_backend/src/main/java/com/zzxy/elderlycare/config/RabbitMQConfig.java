package com.zzxy.elderlycare.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String HEALTH_EXCHANGE = "health.exchange";
    public static final String HEALTH_QUEUE = "health.queue";
    public static final String HEALTH_ROUTING_KEY = "health.routingkey";
    public static final String ALERT_QUEUE = "alert.queue";
    public static final String ALERT_ROUTING_KEY = "alert.routingkey";

    @Bean
    public DirectExchange healthExchange() {
        return new DirectExchange(HEALTH_EXCHANGE);
    }

    @Bean
    public Queue healthQueue() {
        return new Queue(HEALTH_QUEUE);
    }

    @Bean
    public Queue alertQueue() {
        return new Queue(ALERT_QUEUE);
    }

    @Bean
    public Binding healthBinding(Queue healthQueue, DirectExchange healthExchange) {
        return BindingBuilder.bind(healthQueue)
                .to(healthExchange)
                .with(HEALTH_ROUTING_KEY);
    }

    @Bean
    public Binding alertBinding(Queue alertQueue, DirectExchange healthExchange) {
        return BindingBuilder.bind(alertQueue)
                .to(healthExchange)
                .with(ALERT_ROUTING_KEY);
    }
} 