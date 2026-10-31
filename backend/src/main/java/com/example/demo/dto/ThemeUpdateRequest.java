package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class ThemeUpdateRequest {

    @NotBlank(message = "Theme preference is required")
    private String themePreference;

    public ThemeUpdateRequest() {}

    public ThemeUpdateRequest(String themePreference) {
        this.themePreference = themePreference;
    }

    public String getThemePreference() {
        return themePreference;
    }

    public void setThemePreference(String themePreference) {
        this.themePreference = themePreference;
    }
}
