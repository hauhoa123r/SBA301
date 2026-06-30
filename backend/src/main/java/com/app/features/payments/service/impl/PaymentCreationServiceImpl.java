package com.app.features.payments.service.impl;

import com.app.exception.BadRequestException;
import com.app.exception.ResourceNotFoundException;
import com.app.features.coupons.repository.ICouponRepository;
import com.app.features.courses.repository.ICourseRepository;
import com.app.features.model.CourseEntity;
import com.app.features.model.CouponEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PaymentEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.DiscountType;
import com.app.features.payments.converter.InvoiceConverter;
import com.app.features.payments.converter.PaymentConverter;
import com.app.features.payments.converter.PaymentPlanConverter;
import com.app.features.payments.dto.PaymentCreateRequest;
import com.app.features.payments.dto.PaymentCreateResponse;
import com.app.features.payments.gateway.PaymentGateway;
import com.app.features.payments.gateway.PaymentGatewayFactory;
import com.app.features.payments.repository.InvoiceRepository;
import com.app.features.payments.repository.PaymentRepository;
import com.app.features.payments.repository.PaymentUserRepository;
import com.app.features.payments.service.PaymentCreationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PaymentCreationServiceImpl implements PaymentCreationService {
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ICourseRepository courseRepository;
    private final ICouponRepository couponRepository;
    private final PaymentUserRepository paymentUserRepository;
    private final InvoiceConverter invoiceConverter;
    private final PaymentConverter paymentConverter;
    private final PaymentPlanConverter paymentPlanConverter;

    @Override
    @Transactional
    public PaymentCreateResponse createPayment(PaymentCreateRequest request, Long userId) {
        CourseEntity course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.courseId()));
        PlanEntity plan = paymentPlanConverter.resolvePurchasablePlan(course, request.planId());
        UserEntity user = paymentUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        InvoiceEntity invoice = invoiceConverter.toPendingInvoice(user, plan);
        applyCoupon(invoice, request.couponCode());
        invoiceRepository.save(invoice);

        String invoiceCode = "INV-" + invoice.getId();
        PaymentGateway gateway = paymentGatewayFactory.getGateway(request.provider());
        PaymentCreateResponse gatewayResponse = gateway.createPayment(request, invoice, invoiceCode);

        PaymentEntity payment = paymentConverter.toCreatedPayment(invoice, request.provider(), invoiceCode, course, plan);
        paymentRepository.save(payment);

        return gatewayResponse;
    }

    private void applyCoupon(InvoiceEntity invoice, String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return;
        }

        CouponEntity coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new BadRequestException("Coupon not found"));
        Instant now = Instant.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            throw new BadRequestException("Coupon is not active yet");
        }
        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            throw new BadRequestException("Coupon has expired");
        }

        int maxUses = coupon.getMaxUses() == null ? Integer.MAX_VALUE : coupon.getMaxUses();
        int usedCount = coupon.getUsedCount() == null ? 0 : coupon.getUsedCount();
        if (maxUses <= usedCount) {
            throw new BadRequestException("Coupon is out of uses");
        }

        BigDecimal originalAmount = invoice.getOriginalAmount();
        BigDecimal discountAmount = calculateDiscount(originalAmount, coupon);
        invoice.setCoupon(coupon);
        invoice.setDiscountAmount(discountAmount);
        invoice.setAmount(originalAmount.subtract(discountAmount).max(BigDecimal.ZERO));
    }

    private BigDecimal calculateDiscount(BigDecimal originalAmount, CouponEntity coupon) {
        BigDecimal discountValue = coupon.getDiscountValue() == null ? BigDecimal.ZERO : coupon.getDiscountValue();
        BigDecimal discountAmount = coupon.getDiscountType() == DiscountType.PERCENTAGE
                ? originalAmount.multiply(discountValue).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : discountValue;
        return discountAmount.min(originalAmount).max(BigDecimal.ZERO);
    }
}
