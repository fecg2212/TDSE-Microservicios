const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchStream() {
  const [postsResponse, streamResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/posts`),
    fetch(`${API_BASE_URL}/api/stream`)
  ]);

  if (!postsResponse.ok || !streamResponse.ok) {
    throw new Error('Cannot load stream now');
  }

  const posts = await postsResponse.json();
  const stream = await streamResponse.json();
  return { posts, stream };
}

export async function createPost(token, content) {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.errors?.content || 'Cannot create post');
  }

  return response.json();
}

export async function fetchMe(token) {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Cannot load profile');
  }

  return response.json();
}
