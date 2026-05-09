package com.sustainability.tracker.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = FuelTypeValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidFuelType {
    String message() default "Fuel type must be specified for CAR or AUTO and must be NA for other transport modes.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
