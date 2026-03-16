package com.carboncalc.app.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiconfig {

    @Bean
    public OpenAPI carbonCalcOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CarbonCalc API")
                        .description("Backend APIs for Personal Carbon Footprint Application")
                        .version("1.0.0"))
                .externalDocs(new ExternalDocumentation()
                        .description("CarbonCalc Internship Project"));
    }
}