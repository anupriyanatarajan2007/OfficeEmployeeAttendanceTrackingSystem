package com.example.demo.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public authentication & static/docs
                .requestMatchers("/api/auth/**").permitAll()
                
                // Allow legacy endpoints for backwards compatibility
                .requestMatchers("/employees/**", "/attendance-records/**", "/attendancelogs/**", "/daily-summary/**", "/admin/**").permitAll()

                // Admin-only endpoints
                .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                
                // Admin & HR management endpoints
                .requestMatchers(HttpMethod.POST, "/api/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.PUT, "/api/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.DELETE, "/api/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/departments/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/shifts/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/holidays/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/office-location/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/qr/active").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/anomalies/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers("/api/leaves/*/approve", "/api/leaves/*/reject", "/api/leaves/pending").hasAnyRole("ADMIN", "HR")

                // Authenticated user operations (Employee / HR / Admin)
                .requestMatchers("/api/attendance/check-in", "/api/attendance/check-out").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/attendance/verify-location", "/api/attendance/verify-face", "/api/attendance/verify-qr").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/attendance/my/**").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/leaves/apply", "/api/leaves/my", "/api/leaves/*/cancel").hasAnyRole("ADMIN", "HR", "EMPLOYEE")
                .requestMatchers("/api/notifications/**").authenticated()

                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
