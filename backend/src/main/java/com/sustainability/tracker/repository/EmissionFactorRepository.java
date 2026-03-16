package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {

    Optional<EmissionFactor> findByCategoryAndFactorKey(String category, String factorKey);

    List<EmissionFactor> findAllByOrderByCategoryAscFactorKeyAsc();
}
