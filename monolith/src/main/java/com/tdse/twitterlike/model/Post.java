package com.tdse.twitterlike.model;

import java.time.Instant;
import java.util.UUID;

public record Post(
        UUID id,
        String userId,
        String username,
        String content,
        Instant createdAt
) {
}
