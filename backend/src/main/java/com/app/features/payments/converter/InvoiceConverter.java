package com.app.features.payments.converter;

import com.app.exception.BadRequestException;
import com.app.features.coupons.repository.ICouponRepository;
import com.app.features.model.CouponEntity;
import com.app.features.model.InvoiceEntity;
import com.app.features.model.PlanEntity;
import com.app.features.model.SubscriptionEntity;
import com.app.features.model.UserEntity;
import com.app.features.model.enums.DiscountType;
import com.app.features.model.enums.InvoiceStatus;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Component
public class InvoiceConverter {
    private final ModelMapper modelMapper;
    private final ICouponRepository couponRepository;

    public InvoiceConverter(ModelMapper modelMapper, ICouponRepository couponRepository) {
        this.modelMapper = modelMapper;
        this.couponRepository = couponRepository;
    }

    public InvoiceEntity toPendingInvoice(UserEntity user, PlanEntity plan) {
        InvoiceEntity source = new InvoiceEntity();
        source.setOriginalAmount(plan.getPrice());
        source.setDiscountAmount(BigDecimal.ZERO);
        source.setAmount(plan.getPrice());
        source.setStatus(InvoiceStatus.PENDING);

        InvoiceEntity invoice = modelMapper.map(source, InvoiceEntity.class);
        invoice.setUser(user);
        return invoice;
    }

    public void applyPaymentResult(InvoiceEntity invoice, boolean success) {
        invoice.setStatus(success ? InvoiceStatus.PAID : InvoiceStatus.FAILED);
    }

    public void attachSubscription(InvoiceEntity invoice, SubscriptionEntity subscription) {
        invoice.setSubscription(subscription);
    }

    public void applyCoupon(InvoiceEntity invoice, String couponCode) {
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
