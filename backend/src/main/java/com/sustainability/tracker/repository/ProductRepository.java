package com.sustainability.tracker.repository;

import com.sustainability.tracker.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Product> findByCategoryAndIsActiveTrueOrderByRatingDesc(String category);

    List<Product> findByIsActiveTrueAndStockQuantityGreaterThanOrderByCreatedAtDesc(Integer minStock);
}
