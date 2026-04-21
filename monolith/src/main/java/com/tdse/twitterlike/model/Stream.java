package com.tdse.twitterlike.model;

import java.util.List;

public record Stream(List<Post> posts, long totalPosts) {
}
