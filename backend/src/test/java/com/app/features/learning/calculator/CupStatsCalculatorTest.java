package com.app.features.learning.calculator;
import com.app.features.learning.dto.record.*;
import com.app.features.model.UserEntity;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class CupStatsCalculatorTest {
    private final CupStatsCalculator calculator = new CupStatsCalculator();
    @Test void noQuizDoesNotInventPoints() {
        var user = new UserEntity(); user.setTotalLearningPoints(390);
        assertEquals(new CupStats(0, 0), calculator.calculate(user, new LearningStatsData(0, 0, 0, 0, 0, List.of(), 0, 0)));
    }
    @Test void usesEarnedWeightedPointsInsteadOfPercentageSum() {
        assertEquals(new CupStats(30, 40), calculator.calculate(new UserEntity(), new LearningStatsData(1, 1, 0, 1, 0, List.of(75), 40, 30)));
    }
}
