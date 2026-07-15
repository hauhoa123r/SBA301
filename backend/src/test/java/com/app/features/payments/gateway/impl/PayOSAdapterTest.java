package com.app.features.payments.gateway.impl;

import com.app.features.payments.dto.PaymentVerifyResponse;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PayOSAdapterTest {

    @Test
    void buildOrderCodeCombinesTimeAndInvoiceId() {
        long first = PayOSAdapter.buildOrderCode(1_750_000_000L, 8L);
        long secondInvoice = PayOSAdapter.buildOrderCode(1_750_000_000L, 9L);
        long secondTime = PayOSAdapter.buildOrderCode(1_750_000_001L, 8L);

        assertEquals(175_000_000_000_008L, first);
        assertNotEquals(first, secondInvoice);
        assertNotEquals(first, secondTime);
        assertTrue(first < 9_007_199_254_740_991L);
    }

    @Test
    void extractDataReturnsSuccessfulPayload() {
        PayOSAdapter adapter = new PayOSAdapter();
        Map<String, Object> data = Map.of("checkoutUrl", "https://pay.payos.vn/example");

        Map<String, Object> result = adapter.extractData(Map.of(
                "code", "00",
                "desc", "success",
                "data", data
        ));

        assertEquals(data, result);
    }

    @Test
    void extractDataPreservesPayosErrorDetails() {
        PayOSAdapter adapter = new PayOSAdapter();

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                adapter.extractData(Map.of(
                        "code", "231",
                        "desc", "Payment order already exists"
                ))
        );

        assertTrue(exception.getMessage().contains("code=231"));
        assertTrue(exception.getMessage().contains("Payment order already exists"));
    }

    @Test
    void verifyCallbackTreatsSignedCode00AsSuccessful() throws Exception {
        String checksumKey = "test-checksum-key";
        PayOSAdapter adapter = new PayOSAdapter();
        ReflectionTestUtils.setField(adapter, "checksumKey", checksumKey);

        Map<String, String> params = new HashMap<>();
        params.put("orderCode", "175000000000008");
        params.put("amount", "199000");
        params.put("code", "00");
        params.put("desc", "success");
        params.put("paymentLinkId", "payment-link-id");
        params.put("reference", "bank-reference");
        params.put("signature", sign(params, checksumKey));

        PaymentVerifyResponse response = adapter.verifyCallback(params);

        assertTrue(response.valid());
        assertTrue(response.success());
        assertEquals("175000000000008", response.invoiceCode());
        assertEquals("bank-reference", response.gatewayTransactionId());
    }

    @Test
    void verifyCallbackKeepsSignedPayosErrorUnsuccessful() throws Exception {
        String checksumKey = "test-checksum-key";
        PayOSAdapter adapter = new PayOSAdapter();
        ReflectionTestUtils.setField(adapter, "checksumKey", checksumKey);

        Map<String, String> params = new HashMap<>();
        params.put("orderCode", "175000000000008");
        params.put("code", "01");
        params.put("desc", "failed");
        params.put("signature", sign(params, checksumKey));

        PaymentVerifyResponse response = adapter.verifyCallback(params);

        assertTrue(response.valid());
        assertFalse(response.success());
    }

    private String sign(Map<String, String> data, String key) throws Exception {
        String rawData = new TreeMap<>(data).entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(hmac.doFinal(rawData.getBytes(StandardCharsets.UTF_8)));
    }
}
