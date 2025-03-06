package com.zzxy.elderlycare.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String HEALTH_EXCHANGE = "health.exchange";
    public static final String HEALTH_QUEUE = "health.queue";
    public static final String HEALTH_ROUTING_KEY = "health.data";
    public static final String ALERT_QUEUE = "alert.queue";
    public static final String ALERT_ROUTING_KEY = "health.alert";

    @Bean
    public Exchange healthExchange() {
        return ExchangeBuilder.directExchange(HEALTH_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public Queue healthQueue() {
        return QueueBuilder.durable(HEALTH_QUEUE).build();
    }

    @Bean
    public Queue alertQueue() {
        return QueueBuilder.durable(ALERT_QUEUE).build();
    }

    @Bean
    public Binding healthBinding() {
        return BindingBuilder
                .bind(healthQueue())
                .to(healthExchange())
                .with(HEALTH_ROUTING_KEY)
                .noargs();
    }

    @Bean
    public Binding alertBinding() {
        return BindingBuilder
                .bind(alertQueue())
                .to(healthExchange())
                .with(ALERT_ROUTING_KEY)
                .noargs();
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
} 