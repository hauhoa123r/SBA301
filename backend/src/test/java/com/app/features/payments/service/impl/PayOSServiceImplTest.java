package com.app.features.payments.service.impl;

import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.dto.PayOSPaymentStatus;
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

class PayOSServiceImplTest {

    @Test
    void buildOrderCodeCombinesTimeAndInvoiceId() {
        long first = PayOSServiceImpl.buildOrderCode(1_750_000_000L, 8L);
        long secondInvoice = PayOSServiceImpl.buildOrderCode(1_750_000_000L, 9L);
        long secondTime = PayOSServiceImpl.buildOrderCode(1_750_000_001L, 8L);

        assertEquals(175_000_000_000_008L, first);
        assertNotEquals(first, secondInvoice);
        assertNotEquals(first, secondTime);
        assertTrue(first < 9_007_199_254_740_991L);
    }

    @Test
    void extractDataReturnsSuccessfulPayload() {
        PayOSServiceImpl service = new PayOSServiceImpl();
        Map<String, Object> data = Map.of("checkoutUrl", "https://pay.payos.vn/example");

        Map<String, Object> result = service.extractData(Map.of(
                "code", "00",
                "desc", "success",
                "data", data
        ));

        assertEquals(data, result);
    }

    @Test
    void extractDataPreservesPayosErrorDetails() {
        PayOSServiceImpl service = new PayOSServiceImpl();

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                service.extractData(Map.of(
                        "code", "231",
                        "desc", "Payment order already exists"
                ))
        );

        assertTrue(exception.getMessage().contains("code=231"));
        assertTrue(exception.getMessage().contains("Payment order already exists"));
    }

    @Test
    void extractPaymentStatusReturnsPaidAmountAndOrderCode() {
        PayOSServiceImpl service = new PayOSServiceImpl();

        PayOSPaymentStatus status = service.extractPaymentStatus(Map.of(
                "code", "00",
                "desc", "success",
                "data", Map.of(
                        "id", "payment-link-id",
                        "orderCode", 175000000000008L,
                        "amountPaid", 199000,
                        "status", "PAID"
                )
        ));

        assertEquals("175000000000008", status.transactionId());
        assertEquals("PAID", status.status());
        assertEquals(0, status.amountPaid().compareTo(new java.math.BigDecimal("199000")));
        assertTrue(status.paid());
        assertTrue(status.terminal());
    }

    @Test
    void verifyCallbackTreatsSignedCode00AsSuccessful() throws Exception {
        String checksumKey = "test-checksum-key";
        PayOSServiceImpl service = new PayOSServiceImpl();
        ReflectionTestUtils.setField(service, "checksumKey", checksumKey);

        Map<String, String> params = new HashMap<>();
        params.put("orderCode", "175000000000008");
        params.put("amount", "199000");
        params.put("code", "00");
        params.put("desc", "success");
        params.put("paymentLinkId", "payment-link-id");
        params.put("reference", "bank-reference");
        params.put("signature", sign(params, checksumKey));

        PaymentVerifyResponse response = service.verifyCallback(params);

        assertTrue(response.valid());
        assertTrue(response.success());
        assertEquals("175000000000008", response.invoiceCode());
        assertEquals("bank-reference", response.gatewayTransactionId());
    }

    @Test
    void verifyCallbackKeepsSignedPayosErrorUnsuccessful() throws Exception {
        String checksumKey = "test-checksum-key";
        PayOSServiceImpl service = new PayOSServiceImpl();
        ReflectionTestUtils.setField(service, "checksumKey", checksumKey);

        Map<String, String> params = new HashMap<>();
        params.put("orderCode", "175000000000008");
        params.put("code", "01");
        params.put("desc", "failed");
        params.put("signature", sign(params, checksumKey));

        PaymentVerifyResponse response = service.verifyCallback(params);

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
