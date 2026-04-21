package com.tdse.twitterlike.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank(message = "Post content cannot be blank")
        @Size(max = 140, message = "Post must be at most 140 characters")
        String content
) {
}
