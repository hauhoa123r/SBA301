package com.app.features.reports.repository;

import com.app.features.model.ReportEntity;
import com.app.features.model.enums.ReportStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<ReportEntity, Long> {
    @EntityGraph(attributePaths = {"reporter", "resolvedBy"})
    List<ReportEntity> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"reporter", "resolvedBy"})
    List<ReportEntity> findAllByStatusOrderByCreatedAtDesc(ReportStatus status);

    @Override
    @EntityGraph(attributePaths = {"reporter", "resolvedBy"})
    Optional<ReportEntity> findById(Long id);
}
