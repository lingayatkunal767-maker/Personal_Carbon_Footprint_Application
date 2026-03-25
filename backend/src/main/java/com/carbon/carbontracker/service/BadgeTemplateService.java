package com.carbon.carbontracker.service;

import com.carbon.carbontracker.model.BadgeTemplate;
import com.carbon.carbontracker.repository.BadgeTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BadgeTemplateService {

    @Autowired
    private BadgeTemplateRepository badgeTemplateRepository;

    private String generateCodeFromName(String name) {
        if (name == null) {
            return null;
        }
        String base = name
                .trim()
                .replaceAll("[^a-zA-Z0-9]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "")
                .toUpperCase();
        return base.isEmpty() ? null : base;
    }

    public List<BadgeTemplate> getAll() {
        return badgeTemplateRepository.findAll();
    }

    public BadgeTemplate getById(Long id) {
        return badgeTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Badge template not found: " + id));
    }

    public BadgeTemplate create(BadgeTemplate template) {
        template.setId(null);
        if (template.getCode() == null || template.getCode().trim().isEmpty()) {
            template.setCode(generateCodeFromName(template.getName()));
        }
        return badgeTemplateRepository.save(template);
    }

    public BadgeTemplate update(Long id, BadgeTemplate updated) {
        BadgeTemplate existing = getById(id);
        existing.setName(updated.getName());
        String code = updated.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateCodeFromName(updated.getName());
        }
        existing.setCode(code);
        existing.setDescription(updated.getDescription());
        existing.setConditionText(updated.getConditionText());
        existing.setIcon(updated.getIcon());
        existing.setActive(updated.isActive());
        return badgeTemplateRepository.save(existing);
    }
}

