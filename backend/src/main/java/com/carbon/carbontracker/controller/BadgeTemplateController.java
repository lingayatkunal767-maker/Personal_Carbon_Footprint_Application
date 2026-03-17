package com.carbon.carbontracker.controller;

import com.carbon.carbontracker.model.BadgeTemplate;
import com.carbon.carbontracker.service.BadgeTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badge-templates")
public class BadgeTemplateController {

    @Autowired
    private BadgeTemplateService badgeTemplateService;

    @GetMapping
    public ResponseEntity<List<BadgeTemplate>> getAll() {
        return ResponseEntity.ok(badgeTemplateService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BadgeTemplate> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(badgeTemplateService.getById(id));
    }

    @PostMapping
    public ResponseEntity<BadgeTemplate> create(@RequestBody BadgeTemplate template) {
        return ResponseEntity.ok(badgeTemplateService.create(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BadgeTemplate> update(@PathVariable Long id, @RequestBody BadgeTemplate updated) {
        return ResponseEntity.ok(badgeTemplateService.update(id, updated));
    }
}

