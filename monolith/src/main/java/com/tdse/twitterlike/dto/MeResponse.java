package com.tdse.twitterlike.dto;

import java.util.List;

public record MeResponse(
        String sub,
        String name,
        String email,
        List<String> scopes
) {
}
