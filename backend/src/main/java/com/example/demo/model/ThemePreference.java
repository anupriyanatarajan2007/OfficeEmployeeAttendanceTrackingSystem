package com.example.demo.model;

public enum ThemePreference {
    DARK,
    LIGHT,
    OCEAN,
    PURPLE,
    GREEN,
    HIGH_CONTRAST;

    public static ThemePreference fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DARK;
        }
        try {
            return ThemePreference.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return DARK;
        }
    }
}
