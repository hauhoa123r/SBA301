package com.app.features.model;

import com.app.features.model.CourseEntity;
import com.app.features.model.PlanEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "course_plan_access", schema = "chinese_online_learning")
public class CoursePlanAccessEntity {
    @EmbeddedId
    private CoursePlanAccessIdEntity id;

    @MapsId("courseId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseEntity course;

    @MapsId("planId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanEntity plan;


}