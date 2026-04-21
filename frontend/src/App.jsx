import { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { createPost, fetchMe, fetchStream } from './api';

export default function App() {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [content, setContent] = useState('');
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [loadingFeed, setLoadingFeed] = useState(true);

  const remaining = useMemo(() => 140 - content.length, [content]);

  const loadFeed = async () => {
    setLoadingFeed(true);
    setError('');
    try {
      const { posts: loadedPosts, stream } = await fetchStream();
      setPosts(loadedPosts);
      setTotalPosts(stream.totalPosts ?? loadedPosts.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFeed(false);
    }
  };

  const loadProfile = async () => {
    if (!isAuthenticated) {
      setMe(null);
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const profile = await fetchMe(token);
      setMe(profile);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    loadProfile();
  }, [isAuthenticated]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    if (!content.trim()) {
      setError('Post cannot be empty');
      return;
    }

    if (content.length > 140) {
      setError('Post exceeds 140 characters');
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      await createPost(token, content.trim());
      setContent('');
      await loadFeed();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <main className="page"><p>Loading authentication...</p></main>;
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">TDSE Experimental Lab</p>
          <h1>Secure Public Stream</h1>
          <p className="subtitle">A Twitter-like feed with Auth0-secured posting.</p>
        </div>
        <div className="auth-actions">
          {!isAuthenticated ? (
            <button onClick={() => loginWithRedirect()}>Log in</button>
          ) : (
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Log out</button>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Global Stream</h2>
        <p className="muted">Total posts: {totalPosts}</p>
        <button className="refresh" onClick={loadFeed}>Refresh stream</button>

        {loadingFeed ? <p>Loading stream...</p> : null}
        {!loadingFeed && posts.length === 0 ? <p>No posts yet. Be the first one.</p> : null}

        <div className="stream-list">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <header>
                <strong>{post.username}</strong>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </header>
              <p>{post.content}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Create Post</h2>
        <form onSubmit={onSubmit}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={140}
            placeholder="What is happening right now?"
          />
          <div className="form-footer">
            <span className={remaining < 0 ? 'counter bad' : 'counter'}>{remaining} chars left</span>
            <button type="submit" disabled={!isAuthenticated}>Publish</button>
          </div>
        </form>
        {!isAuthenticated ? <p className="muted">Login is required to publish posts.</p> : null}
      </section>

      <section className="panel">
        <h2>My Profile (/api/me)</h2>
        {!isAuthenticated ? <p className="muted">Authenticate to view protected profile data.</p> : null}
        {isAuthenticated && me ? (
          <pre>{JSON.stringify(me, null, 2)}</pre>
        ) : null}
        {isAuthenticated && !me ? <p>Loading profile...</p> : null}
      </section>

      {error ? <div className="error-box">{error}</div> : null}
      {isAuthenticated && user ? <p className="session">Logged in as {user.name || user.email}</p> : null}
    </main>
  );
}
