package com.carbon.carbon.controller;

import com.carbon.carbon.entity.User;
import com.carbon.carbon.entity.EmissionRecord;
import com.carbon.carbon.repository.EmissionRecordRepository;
import com.carbon.carbon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emissions")
@CrossOrigin
public class EmissionRecordController {
    @Autowired
    private EmissionRecordRepository emissionRecordRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<EmissionRecord> getUserEmissions(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return emissionRecordRepository.findByUserId(user.getId());
    }

    @PostMapping
    public ResponseEntity<?> addEmission(@RequestBody EmissionRecord record, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        record.setUser(user);
        emissionRecordRepository.save(record);
        return ResponseEntity.ok(record);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmission(@PathVariable Long id, @RequestBody EmissionRecord updated, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        EmissionRecord record = emissionRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emission record not found"));
        if (!record.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to update this record");
        }
        record.setCategory(updated.getCategory());
        record.setActivityType(updated.getActivityType());
        record.setQuantity(updated.getQuantity());
        record.setCarbonOutput(updated.getCarbonOutput());
        emissionRecordRepository.save(record);
        return ResponseEntity.ok(record);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmission(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        EmissionRecord record = emissionRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emission record not found"));
        if (!record.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to delete this record");
        }
        emissionRecordRepository.delete(record);
        return ResponseEntity.ok().build();
    }
}
