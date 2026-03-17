// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.cors.*;

// @Configuration
// public class CorsConfig {

//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration config = new CorsConfiguration();

//         config.setAllowCredentials(true);
//         config.addAllowedOrigin("http://localhost:5173");
//         config.addAllowedHeader("*");
//         config.addAllowedMethod("*");

//         UrlBasedCorsConfigurationSource source =
//                 new UrlBasedCorsConfigurationSource();

//         source.registerCorsConfiguration("/**", config);
//         return source;
//     }
// }