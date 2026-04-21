package com.tdse.twitterlike.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tdse.twitterlike.dto.CreatePostRequest;
import com.tdse.twitterlike.model.Post;
import com.tdse.twitterlike.model.Stream;
import com.tdse.twitterlike.service.PostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @Operation(summary = "Get all posts in public stream")
    @ApiResponse(responseCode = "200", description = "Posts retrieved")
    @GetMapping("/posts")
    public List<Post> getPosts() {
        return postService.getAllPosts();
    }

    @Operation(summary = "Get global stream")
    @ApiResponse(responseCode = "200", description = "Stream retrieved")
    @GetMapping("/stream")
    public Stream getStream() {
        return postService.getGlobalStream();
    }

    @Operation(
            summary = "Create a post (max 140 chars)",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Post created",
            content = @Content(schema = @Schema(implementation = Post.class)))
    @ApiResponse(responseCode = "401", description = "Unauthorized")
    @PostMapping("/posts")
    public Post createPost(@Valid @RequestBody CreatePostRequest request,
                           @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        String username = jwt.getClaimAsString("name") != null
                ? jwt.getClaimAsString("name")
                : jwt.getClaimAsString("nickname");
        if (username == null || username.isBlank()) {
            username = "anonymous";
        }
        return postService.createPost(userId, username, request.content());
    }
}
