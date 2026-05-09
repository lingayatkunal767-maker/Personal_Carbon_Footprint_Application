package com.sustainability.tracker.config;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ApiErrorAttributes extends DefaultErrorAttributes {

    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, ErrorAttributeOptions options) {
        ErrorAttributeOptions enrichedOptions = options
                .including(ErrorAttributeOptions.Include.MESSAGE)
                .including(ErrorAttributeOptions.Include.BINDING_ERRORS);

        Map<String, Object> original = super.getErrorAttributes(webRequest, enrichedOptions);

        int statusCode = toInt(original.get("status"), HttpStatus.INTERNAL_SERVER_ERROR.value());
        HttpStatus status = HttpStatus.resolve(statusCode);
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        Map<String, Object> normalized = new LinkedHashMap<>();
        normalized.put("timestamp", original.getOrDefault("timestamp", LocalDateTime.now()));
        normalized.put("status", statusCode);
        normalized.put("error", original.getOrDefault("error", status.getReasonPhrase()));
        normalized.put("message", messageFrom(original.get("message"), status));
        normalized.put("path", original.getOrDefault("path", ""));
        normalized.put("errors", extractFieldErrors(original.get("errors")));

        return normalized;
    }

    private int toInt(Object value, int fallback) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return fallback;
    }

    private String messageFrom(Object rawMessage, HttpStatus status) {
        String message = rawMessage == null ? "" : String.valueOf(rawMessage).trim();
        return message.isEmpty() ? status.getReasonPhrase() : message;
    }

    private Map<String, String> extractFieldErrors(Object errorsObject) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (errorsObject instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Map<?, ?> mapItem) {
                    Object fieldValue = mapItem.containsKey("field") ? mapItem.get("field") : "request";
                    Object messageValue = mapItem.containsKey("defaultMessage")
                            ? mapItem.get("defaultMessage")
                            : (mapItem.containsKey("message") ? mapItem.get("message") : "Invalid value");

                    String field = String.valueOf(fieldValue);
                    String message = String.valueOf(messageValue);
                    errors.put(field, message);
                }
            }
        }

        return errors;
    }
}
