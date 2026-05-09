package com.sustainability.tracker;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.ServerSocket;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.PortInUseException;

@SpringBootApplication
public class TrackerApplication {
    private static final Logger LOGGER = LoggerFactory.getLogger(TrackerApplication.class);
    private static final Duration STARTUP_PROBE_TIMEOUT = Duration.ofSeconds(2);
    private static final int DEFAULT_SERVER_PORT = 8081;

    public static void main(String[] args) {
        int configuredPort = resolveConfiguredPort();
        if (isPortInUse(configuredPort) && isExistingBackendHealthy(configuredPort)) {
            LOGGER.info("Backend is already running on port {}. Skipping duplicate startup.", configuredPort);
            return;
        }

        try {
            SpringApplication.run(TrackerApplication.class, args);
        } catch (RuntimeException ex) {
            PortInUseException portInUse = findPortInUseException(ex);
            if (portInUse != null && isExistingBackendHealthy(portInUse.getPort())) {
                LOGGER.info("Backend is already running on port {}. Skipping duplicate startup.", portInUse.getPort());
                return;
            }
            throw ex;
        }
    }

    private static int resolveConfiguredPort() {
        String fromSystemProperty = System.getProperty("server.port");
        if (fromSystemProperty != null && !fromSystemProperty.isBlank()) {
            try {
                return Integer.parseInt(fromSystemProperty.trim());
            } catch (NumberFormatException ignored) {
            }
        }

        String fromEnvironment = System.getenv("SERVER_PORT");
        if (fromEnvironment != null && !fromEnvironment.isBlank()) {
            try {
                return Integer.parseInt(fromEnvironment.trim());
            } catch (NumberFormatException ignored) {
            }
        }

        return DEFAULT_SERVER_PORT;
    }

    private static PortInUseException findPortInUseException(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof PortInUseException) {
                return (PortInUseException) current;
            }
            current = current.getCause();
        }
        return null;
    }

    private static boolean isExistingBackendHealthy(int port) {
        return endpointRespondsOk("http://localhost:" + port + "/actuator/health")
            || endpointRespondsOk("http://localhost:" + port + "/api/users");
    }

    private static boolean isPortInUse(int port) {
        try (ServerSocket socket = new ServerSocket()) {
            socket.setReuseAddress(false);
            socket.bind(new InetSocketAddress(port));
            return false;
        } catch (IOException ex) {
            return true;
        }
    }

    private static boolean endpointRespondsOk(String url) {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(STARTUP_PROBE_TIMEOUT)
            .build();

        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
            .GET()
            .timeout(STARTUP_PROBE_TIMEOUT)
            .build();

        try {
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (IOException e) {
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}
