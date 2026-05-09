package com.sustainability.tracker.config;

import com.sustainability.tracker.dto.ApiErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiExceptionHandlerTest {

    @Test
    void handleHttpMessageNotReadableReturnsBadRequest() {
        ApiExceptionHandler handler = new ApiExceptionHandler();
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/survey");

        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
            "JSON parse error: invalid enum value",
            new MockHttpInputMessage(new byte[0])
        );

        ResponseEntity<ApiErrorResponse> response = handler.handleHttpMessageNotReadable(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(400, body.getStatus());
        assertEquals("Bad Request", body.getError());
        assertEquals("/api/survey", body.getPath());
        assertTrue(body.getMessage().contains("invalid enum value"));
        assertEquals(Map.of(), body.getErrors());
    }
}
