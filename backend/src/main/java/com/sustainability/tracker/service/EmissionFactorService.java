package com.sustainability.tracker.service;

import com.sustainability.tracker.dto.EmissionFactorDTO;
import com.sustainability.tracker.entity.EmissionFactor;
import com.sustainability.tracker.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmissionFactorService {

    private final EmissionFactorRepository emissionFactorRepository;

    @Transactional(readOnly = true)
    public List<EmissionFactorDTO> getAllFactors() {
        return emissionFactorRepository.findAllByOrderByCategoryAscFactorKeyAsc()
                .stream()
                .map(EmissionFactorDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getFactorValue(String category, String factorKey, BigDecimal fallback) {
        BigDecimal safeFallback = fallback != null ? fallback : BigDecimal.ZERO;
        Optional<EmissionFactor> factor = emissionFactorRepository.findByCategoryAndFactorKey(
                normalize(category), normalize(factorKey)
        );
        return factor.map(EmissionFactor::getFactorValue).orElse(safeFallback);
    }

    public EmissionFactorDTO upsertFactor(EmissionFactorDTO request) {
        String category = normalize(request.getCategory());
        String factorKey = normalize(request.getFactorKey());

        EmissionFactor factor = emissionFactorRepository
                .findByCategoryAndFactorKey(category, factorKey)
                .orElseGet(EmissionFactor::new);

        factor.setCategory(category);
        factor.setFactorKey(factorKey);
        factor.setFactorValue(request.getFactorValue());
        factor.setUnit(request.getUnit());
        factor.setDescription(request.getDescription());

        return EmissionFactorDTO.from(emissionFactorRepository.save(factor));
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
