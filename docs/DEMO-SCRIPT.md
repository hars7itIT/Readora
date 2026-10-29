# Hackathon Demo Script

1. **Launch App**: Run `npm run dev` and navigate to `http://localhost:5173`.
2. **Add Subscriptions**:
   - Use the sample suggestions on the welcome card or add `https://jvns.ca/atom.xml`.
   - Observe automatic discovery of title and feed entries.
3. **Timeline & Offline Reading**:
   - Read an article. Click it to view the distraction-free reader mode parsed via Mozilla Readability.
   - Disconnect network in browser DevTools (Network tab -> Offline).
   - Reload page: notice that all subscribed feeds, cached articles, and read states remain instantly available.
4. **SSRF Rejection Verification**:
   - Open browser console or run `curl "http://localhost:8080/api/fetch?url=http://127.0.0.1:8080"`.
   - Notice that the request is promptly rejected with `Private or reserved IP addresses are not allowed`.
5. **Anonymous Discovery & Recommendations**:
   - Navigate to the Discover tab.
   - Toggle "Enable opt-in sharing" and click "Share subscriptions".
   - Notice the aggregate popular feeds and contextual recommendations based on co-subscribed feeds.
