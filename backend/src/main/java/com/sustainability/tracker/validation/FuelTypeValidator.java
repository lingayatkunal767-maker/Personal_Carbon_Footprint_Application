package com.sustainability.tracker.validation;

import com.sustainability.tracker.dto.SurveyRequest;
import com.sustainability.tracker.entity.LifestyleSurvey.FuelType;
import com.sustainability.tracker.entity.LifestyleSurvey.TransportMode;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class FuelTypeValidator implements ConstraintValidator<ValidFuelType, SurveyRequest> {

    @Override
    public boolean isValid(SurveyRequest request, ConstraintValidatorContext context) {
        if (request == null || request.getTransportMode() == null || request.getFuelType() == null) {
            return true; // Let other validators handle nulls
        }

        TransportMode transportMode = request.getTransportMode();
        FuelType fuelType = request.getFuelType();

        if (transportMode == TransportMode.CAR || transportMode == TransportMode.AUTO) {
            if (fuelType == FuelType.NA) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Fuel type cannot be NA for CAR or AUTO.")
                       .addPropertyNode("fuelType").addConstraintViolation();
                return false;
            }
        } else {
            if (fuelType != FuelType.NA) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Fuel type must be NA for non-motorized transport.")
                       .addPropertyNode("fuelType").addConstraintViolation();
                return false;
            }
        }
        return true;
    }
}
