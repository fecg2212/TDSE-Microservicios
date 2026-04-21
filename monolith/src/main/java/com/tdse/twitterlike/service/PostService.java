package com.tdse.twitterlike.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;

import com.tdse.twitterlike.model.Post;
import com.tdse.twitterlike.model.Stream;

@Service
public class PostService {

    private final CopyOnWriteArrayList<Post> posts = new CopyOnWriteArrayList<>();

    public Post createPost(String userId, String username, String content) {
        Post post = new Post(UUID.randomUUID(), userId, username, content, Instant.now());
        posts.add(post);
        return post;
    }

    public List<Post> getAllPosts() {
        return posts.stream()
                .sorted(Comparator.comparing(Post::createdAt).reversed())
                .toList();
    }

    public Stream getGlobalStream() {
        List<Post> orderedPosts = getAllPosts();
        return new Stream(orderedPosts, orderedPosts.size());
    }
}
