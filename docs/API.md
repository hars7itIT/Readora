# API Specification

Base URL: `http://localhost:8080` (or configured `PORT` and `VITE_API_BASE_URL`).

### 1. Health
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "discoveryConfigured": true
  }
  ```

### 2. Safe Fetch Proxy
- **Endpoint**: `GET /api/fetch?url=<encoded_url>`
- **Description**: Fetches the remote resource directly over HTTP/HTTPS, enforces SSRF protections, and streams back the raw response.
- **Headers**:
  - `Content-Type`: Upstream MIME type (restricted to text/html, text/xml, application/rss+xml, etc.)
  - `Content-Security-Policy`: `default-src 'none'; sandbox`
  - `X-Content-Type-Options`: `nosniff`
  - `Cache-Control`: `private, max-age=60`
- **Errors**:
  - `400 Bad Request`: Invalid URL, non-HTTP scheme, internal IP, private host, or credential specified.
  - `502 Bad Gateway`: Upstream server unreachable or returned non-2xx.
  - `504 Gateway Timeout`: Upstream timed out after 9 seconds.

### 3. Discovery: Popular Feeds
- **Endpoint**: `GET /api/discovery/popular`
- **Response**:
  ```json
  {
    "feeds": [
      { "url": "https://news.ycombinator.com/rss", "title": "Hacker News", "count": 24, "reason": "Popular among opted-in reader samples" }
    ]
  }
  ```

### 4. Discovery: Recommendations
- **Endpoint**: `POST /api/discovery/recommendations`
- **Request Body**:
  ```json
  {
    "feeds": ["https://news.ycombinator.com/rss"]
  }
  ```
- **Response**:
  ```json
  {
    "feeds": [
      { "url": "https://jvns.ca/atom.xml", "title": "Julia Evans", "count": 18, "reason": "Frequently followed alongside 1 of your feeds" }
    ]
  }
  ```

### 5. Discovery: Anonymous Subscription Batch Submission
- **Endpoint**: `POST /api/discovery/subscriptions`
- **Request Body**:
  ```json
  {
    "feeds": ["https://news.ycombinator.com/rss", "https://jvns.ca/atom.xml"]
  }
  ```
- **Response**:
  ```json
  {
    "accepted": 2,
    "message": "Anonymous aggregate counts updated."
  }
  ```
