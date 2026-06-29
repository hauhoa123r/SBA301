package com.app.features.payments.gateway;

import com.app.features.model.enums.PaymentProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class PaymentGatewayFactory {
    private final Map<PaymentProvider, PaymentGateway> gatewayMap;

    public PaymentGatewayFactory(List<PaymentGateway> gateways) {
        this.gatewayMap = new EnumMap<>(PaymentProvider.class);
        gateways.forEach(gateway -> gatewayMap.put(gateway.provider(), gateway));
    }

    public PaymentGateway getGateway(PaymentProvider provider) {
        PaymentGateway gateway = gatewayMap.get(provider);
        if (gateway == null) {
            throw new IllegalArgumentException("Unsupported payment provider: " + provider);
        }
        return gateway;
    }
}
