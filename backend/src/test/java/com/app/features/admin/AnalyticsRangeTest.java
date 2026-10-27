package com.app.features.admin;

import com.app.features.admin.service.AnalyticsRange;
import com.app.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;

class AnalyticsRangeTest {
    @Test void vietnamBoundariesAndPreviousRangeAndZeroBuckets() {
        var r=new AnalyticsRange(LocalDate.of(2026,10,1),LocalDate.of(2026,10,2),"hour");
        assertEquals(Instant.parse("2026-09-30T17:00:00Z"),r.start());
        assertEquals(Instant.parse("2026-10-02T17:00:00Z"),r.end());
        assertEquals(24,r.zeroCounts().size()); assertEquals(0L,r.zeroCounts().get("23:00"));
        assertEquals(r.start(),r.previous().end()); assertEquals(2,r.previous().days());
        assertEquals(2,new AnalyticsRange(LocalDate.of(2026,9,30),LocalDate.of(2026,10,1),"month").zeroCounts().size());
        assertEquals(3,new AnalyticsRange(LocalDate.of(2026,10,1),LocalDate.of(2026,10,3),"day").zeroCounts().size());
    }
    @Test void invalidRangesAreRejected() {
        var d=LocalDate.of(2026,10,1);
        assertThrows(BadRequestException.class,()->new AnalyticsRange(d,d.minusDays(1),"day"));
        assertThrows(BadRequestException.class,()->new AnalyticsRange(d,d.plusDays(731),"day"));
        assertThrows(BadRequestException.class,()->new AnalyticsRange(d,d,"year"));
    }
}
