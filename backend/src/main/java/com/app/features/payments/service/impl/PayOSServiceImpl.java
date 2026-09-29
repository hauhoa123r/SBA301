package com.app.features.payments.service.impl;

import com.app.features.model.InvoiceEntity;
import com.app.features.model.enums.PaymentProvider;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.dto.PayOSPaymentStatus;
import com.app.features.payments.dto.PaymentVerifyResponse;
import com.app.features.payments.service.PayOSService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static com.app.utils.StringUtils.isBlank;
import static com.app.utils.StringUtils.shorten;
import static com.app.utils.StringUtils.stringValue;

@Service
@Slf4j
public class PayOSServiceImpl implements PayOSService {
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final long ORDER_CODE_SUFFIX_BASE = 100_000L;

    private final RestClient restClient;

    @Value("${payos.client-id:}")
    private String clientId;

    @Value("${payos.api-key:}")
    private String apiKey;

    @Value("${payos.checksum-key:}")
    private String checksumKey;

    @Value("${payos.create-payment-url:https://api-merchant.payos.vn/v2/payment-requests}")
    private String createPaymentUrl;

    @Value("${payos.payment-request-url:https://api-merchant.payos.vn/v2/payment-requests}")
    private String paymentRequestUrl;

    @Value("${app.frontend.payment-result-url}")
    private String paymentResultUrl;

    public PayOSServiceImpl() {
        this.restClient = RestClient.create();
    }

    @Override
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, InvoiceEntity invoice, String invoiceCode) {
        String resolvedClientId = resolveConfig(clientId, "PAYOS_CLIENT_ID", "CLIENT_ID");
        String resolvedApiKey = resolveConfig(apiKey, "PAYOS_API_KEY", "API_BANK_KEY");
        String resolvedChecksumKey = resolveConfig(checksumKey, "PAYOS_CHECKSUM_KEY", "CHECKSUM_KEY");

        if (isBlank(resolvedClientId) || isBlank(resolvedApiKey) || isBlank(resolvedChecksumKey)) {
            throw new IllegalStateException("Missing payOS configuration. Please set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY.");
        }

        long orderCode = buildOrderCode(Instant.now().getEpochSecond(), invoice.getId());
        long amount = invoice.getAmount().setScale(0, RoundingMode.HALF_UP).longValueExact();
        String description = shorten(invoiceCode, 25);
        String resultQuery = "?invoiceId=" + invoice.getId() + "&invoiceCode=" + invoiceCode;
        String returnUrl = paymentResultUrl + resultQuery;
        String cancelUrl = paymentResultUrl + resultQuery + "&cancel=true";

        Map<String, Object> signaturePayload = new LinkedHashMap<>();
        signaturePayload.put("amount", amount);
        signaturePayload.put("cancelUrl", cancelUrl);
        signaturePayload.put("description", description);
        signaturePayload.put("orderCode", orderCode);
        signaturePayload.put("returnUrl", returnUrl);

        Map<String, Object> requestBody = new LinkedHashMap<>(signaturePayload);
        requestBody.put("signature", sign(signaturePayload, resolvedChecksumKey));
        requestBody.put("items", new Object[]{
                Map.of(
                        "name", "Edujar " + invoice.getSubscriptionPlanCode() + " - " + invoice.getSubscriptionDurationDays() + " days",
                        "quantity", 1,
                        "price", amount
                )
        });
        Map<String, Object> response;
        try {
            response = restClient.post().uri(createPaymentUrl)
                    .header("x-client-id", resolvedClientId)
                    .header("x-api-key", resolvedApiKey).body(requestBody)
                    .retrieve().body(new ParameterizedTypeReference<>() {});
        } catch (RestClientException exception) {
            log.error("payOS payment request failed, invoiceId={}, orderCode={}", invoice.getId(), orderCode, exception);
            throw new IllegalStateException("Unable to create payOS payment link.", exception);
        }
        Map<String, Object> data = extractData(response);
        String checkoutUrl = stringValue(data.get("checkoutUrl"));
        String qrCode = stringValue(data.get("qrCode"));
        String paymentLinkId = stringValue(data.get("paymentLinkId"));
        String paymentLink = isBlank(checkoutUrl) ? stringValue(data.get("paymentLink")) : checkoutUrl;
        String accountName = stringValue(data.get("accountName"));
        String accountNumber = stringValue(data.get("accountNumber"));
        String transferContent = stringValue(data.get("description"));
        if (isBlank(transferContent)) {
            transferContent = description;
        }
        return new PaymentCreateResponse(invoice.getId(), invoiceCode, PaymentProvider.PAYOS, invoice.getAmount(), checkoutUrl, qrCode,
                paymentLink, paymentLinkId, accountName, accountNumber, transferContent, String.valueOf(orderCode)
        );
    }

    @Override
    public PaymentVerifyResponse verifyCallback(Map<String, String> params) {
        String signature = params.get("signature");
        String transactionId = params.get("orderCode");
        Map<String, Object> signedData = params.entrySet().stream()
                .filter(entry -> !"signature".equals(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right, TreeMap::new));

        boolean valid = !isBlank(transactionId)
                && !isBlank(signature)
                && Objects.equals(signature, sign(signedData, resolveConfig(checksumKey, "PAYOS_CHECKSUM_KEY", "CHECKSUM_KEY")));
        boolean success = valid && "00".equals(params.get("code"));
        String gatewayTransactionId = params.get("reference");
        if (isBlank(gatewayTransactionId)) {
            gatewayTransactionId = params.get("paymentLinkId");
        }

        return new PaymentVerifyResponse(valid, success, transactionId, gatewayTransactionId, success ? "payOS success" : "payOS failed");
    }

    @Override
    public PayOSPaymentStatus getPaymentStatus(String transactionId) {
        String resolvedClientId = resolveConfig(clientId, "PAYOS_CLIENT_ID", "CLIENT_ID");
        String resolvedApiKey = resolveConfig(apiKey, "PAYOS_API_KEY", "API_BANK_KEY");
        if (isBlank(resolvedClientId) || isBlank(resolvedApiKey)) {
            throw new IllegalStateException("Missing payOS configuration. Please set PAYOS_CLIENT_ID and PAYOS_API_KEY.");
        }

        Map<String, Object> response;
        try {
            response = restClient.get()
                    .uri(paymentRequestUrl + "/{id}", transactionId)
                    .header("x-client-id", resolvedClientId)
                    .header("x-api-key", resolvedApiKey)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        } catch (RestClientException exception) {
            log.error("payOS status request failed, orderCode={}", transactionId, exception);
            throw new IllegalStateException("Unable to get payOS payment status.", exception);
        }
        return extractPaymentStatus(response);
    }

    static long buildOrderCode(long epochSecond, long invoiceId) {
        return Math.addExact(
                Math.multiplyExact(epochSecond, ORDER_CODE_SUFFIX_BASE),
                Math.floorMod(invoiceId, ORDER_CODE_SUFFIX_BASE)
        );
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> extractData(Map<String, Object> response) {
        if (response == null) {
            throw new IllegalStateException("payOS returned an empty response.");
        }

        String code = safeResponseValue(response.get("code"), "UNKNOWN");
        String description = safeResponseValue(response.get("desc"), "No description");
        if (!"00".equals(code) || !(response.get("data") instanceof Map<?, ?> data)) {
            throw new IllegalStateException(
                    "payOS rejected payment request, code=" + code + ", description=" + description
            );
        }
        return (Map<String, Object>) data;
    }

    PayOSPaymentStatus extractPaymentStatus(Map<String, Object> response) {
        Map<String, Object> data = extractData(response);
        String orderCode = stringValue(data.get("orderCode"));
        String status = stringValue(data.get("status"));
        if (isBlank(orderCode) || isBlank(status)) {
            throw new IllegalStateException("payOS returned an invalid payment status response.");
        }

        return new PayOSPaymentStatus(
                orderCode,
                status,
                decimalValue(data.get("amountPaid")),
                stringValue(data.get("id")),
                data
        );
    }

    private BigDecimal decimalValue(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(stringValue(value));
        } catch (NumberFormatException exception) {
            throw new IllegalStateException("payOS returned an invalid paid amount.", exception);
        }
    }

    private String safeResponseValue(Object value, String fallback) {
        String text = stringValue(value).replace('\r', ' ').replace('\n', ' ').trim();
        return isBlank(text) ? fallback : shorten(text, 200);
    }

    private String sign(Map<String, Object> data, String key) {
        try {
            String rawData = new TreeMap<>(data).entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + stringValue(entry.getValue()))
                    .collect(Collectors.joining("&"));
            Mac hmac = Mac.getInstance(HMAC_SHA256);
            hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] hash = hmac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte value : hash) {
                hex.append(String.format("%02x", value));
            }
            return hex.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign payOS payload.", ex);
        }
    }

    private String resolveConfig(String configuredValue, String... envNames) {
        if (!isBlank(configuredValue)) {
            return configuredValue;
        }
        for (String envName : envNames) {
            String envValue = System.getenv(envName);
            if (!isBlank(envValue)) {
                return envValue;
            }
        }
        for (String envName : envNames) {
            String envValue = readDotEnv(envName);
            if (!isBlank(envValue)) {
                return envValue;
            }
        }
        return "";
    }

    private String readDotEnv(String key) {
        for (Path path : new Path[]{Path.of(".env"), Path.of("backend", ".env")}) {
            if (!Files.exists(path)) {
                continue;
            }
            try {
                return Files.readAllLines(path).stream()
                        .map(String::trim)
                        .filter(line -> line.startsWith(key + "="))
                        .map(line -> line.substring(key.length() + 1).trim())
                        .map(value -> value.replaceAll("^\"|\"$", ""))
                        .findFirst()
                        .orElse("");
            } catch (Exception ignored) {
                return "";
            }
        }
        return "";
    }

}
