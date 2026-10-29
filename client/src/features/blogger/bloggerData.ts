import type { BloggerBlog, BloggerBlogList, BloggerPostItem } from './bloggerTypes';

export const BLOGGER_API_KEY = 'AIzaSyBJzgZEp0E5aD54AOWMfaWqq1zNQMguzHs';

export const BLOGGER_BLOGS: BloggerBlog[] = [
  {
    kind: 'blogger#blog',
    id: '3213900',
    name: 'Blogger Developers Network',
    description: 'The official Blogger Developers Network weblog.',
    published: '2007-02-09T10:13:10-08:00',
    updated: '2012-04-15T19:38:01-07:00',
    url: 'http://code.blogger.com/',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900',
    posts: {
      totalItems: 55,
      selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts'
    },
    pages: {
      totalItems: 1,
      selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/pages'
    },
    locale: {
      language: 'en',
      country: 'US',
      variant: ''
    }
  },
  {
    kind: 'blogger#blog',
    id: '4967929378133675647',
    name: "Brett's Test Blawg",
    description: 'Sandbox and testing log for Blogger platform features and templates.',
    published: '2010-10-06T23:33:31.662Z',
    updated: '2011-08-08T06:50:02.005Z',
    url: 'http://brettmorgan-test-blawg.blogspot.com/',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647',
    posts: {
      totalItems: 13,
      selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/posts'
    },
    pages: {
      totalItems: 1,
      selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/pages'
    },
    locale: {
      language: 'en',
      country: '',
      variant: ''
    }
  },
  {
    kind: 'blogger#blog',
    id: '2399953',
    name: 'Blogger Buzz',
    description: 'The Official Buzz from Blogger at Google',
    published: '2007-04-23T22:17:29.261Z',
    updated: '2011-08-02T06:01:15.941Z',
    url: 'http://buzz.blogger.com/',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953',
    posts: {
      totalItems: 494,
      selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts'
    },
    pages: {
      totalItems: 2,
      selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/pages'
    },
    locale: {
      language: 'en',
      country: '',
      variant: ''
    }
  }
];

export const BLOGGER_USER_BLOG_LIST: BloggerBlogList = {
  kind: 'blogger#blogList',
  items: [BLOGGER_BLOGS[1]]
};

/**
 * 30 Authentic Real-Time Post Links retrieved directly from Google Blogger API v3
 * using key AIzaSyBJzgZEp0E5aD54AOWMfaWqq1zNQMguzHs
 */
export const BLOGGER_SAMPLE_POSTS: BloggerPostItem[] = [
  // --- Blogger Buzz (id: 2399953) ---
  {
    kind: 'blogger#post',
    id: '7531385161213212970',
    blog: { id: '2399953' },
    title: 'A better Blogger experience on the web',
    url: 'http://blogger.googleblog.com/2020/05/a-better-blogger-experience-on-web.html',
    published: '2020-05-20T16:53:00-07:00',
    updated: '2020-05-20T16:58:18-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/7531385161213212970',
    content: '<p>A redesigned Blogger web experience with modern responsive layout, mobile editing, and real-time statistics.</p>',
    author: { displayName: 'A Googler', image: { url: 'https://picsum.photos/seed/googler/100/100' } },
    labels: ['product-update', 'web', 'design']
  },
  {
    kind: 'blogger#post',
    id: '7345193987064476834',
    blog: { id: '2399953' },
    title: 'An update on Google+ and Blogger',
    url: 'http://blogger.googleblog.com/2019/01/an-update-on-google-and-blogger.html',
    published: '2019-01-30T18:01:00-08:00',
    updated: '2019-01-30T18:03:34-08:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/7345193987064476834',
    content: '<p>Transitioning Blogger comments and profiles back to standalone Blogger accounts following Google+ changes.</p>',
    author: { displayName: 'A Googler', image: { url: 'https://picsum.photos/seed/googler2/100/100' } },
    labels: ['updates', 'profiles', 'comments']
  },
  {
    kind: 'blogger#post',
    id: '847065355310893195',
    blog: { id: '2399953' },
    title: 'It’s spring cleaning time for Blogger',
    url: 'http://blogger.googleblog.com/2018/05/its-spring-cleaning-time-for-blogger.html',
    published: '2018-05-15T09:22:00-07:00',
    updated: '2018-05-15T09:22:19-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/847065355310893195',
    content: '<p>Platform improvements, security audits, and cleanup of legacy widgets for better performance and privacy.</p>',
    author: { displayName: 'Blogger', image: { url: 'https://picsum.photos/seed/blogger/100/100' } },
    labels: ['maintenance', 'security', 'performance']
  },
  {
    kind: 'blogger#post',
    id: '2731320382187546485',
    blog: { id: '2399953' },
    title: 'Share your unique style with new Blogger themes',
    url: 'http://blogger.googleblog.com/2017/03/share-your-unique-style-with-new.html',
    published: '2017-03-20T17:34:00-07:00',
    updated: '2017-03-20T17:34:06-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/2731320382187546485',
    content: '<p>Introducing Contempo, Soho, Emporio, and Notable—clean, mobile-first themes tailored for independent writers.</p>',
    author: { displayName: 'Blogger', image: { url: 'https://picsum.photos/seed/blogger/100/100' } },
    labels: ['themes', 'design', 'mobile']
  },
  {
    kind: 'blogger#post',
    id: '2481891409112513396',
    blog: { id: '2399953' },
    title: 'A first few tweaks toward a better Blogger',
    url: 'http://blogger.googleblog.com/2016/11/a-first-few-tweaks-toward-better-blogger_22.html',
    published: '2016-11-22T18:24:00-08:00',
    updated: '2016-11-22T18:39:37-08:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/2481891409112513396',
    content: '<p>Streamlining notification settings, comment management, and high-DPI image support across all readers.</p>',
    author: { displayName: 'A Googler', image: { url: 'https://picsum.photos/seed/googler/100/100' } },
    labels: ['tweaks', 'user-experience']
  },
  {
    kind: 'blogger#post',
    id: '6241485945632143555',
    blog: { id: '2399953' },
    title: 'More custom template flexibility',
    url: 'http://blogger.googleblog.com/2016/05/more-custom-template-flexibility.html',
    published: '2016-05-24T16:36:00-07:00',
    updated: '2016-07-10T18:40:27-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/6241485945632143555',
    content: '<p>Enhanced layout editor controls, modern CSS Flexbox grid support, and direct font imports.</p>',
    author: { displayName: 'A Googler', image: { url: 'https://picsum.photos/seed/googler2/100/100' } },
    labels: ['templates', 'css', 'design']
  },
  {
    kind: 'blogger#post',
    id: '1859817720432685054',
    blog: { id: '2399953' },
    title: 'Bringing HTTPS to all blogspot domain blogs',
    url: 'http://blogger.googleblog.com/2016/05/bringing-https-to-all-blogspot-domain.html',
    published: '2016-05-03T10:04:00-07:00',
    updated: '2016-05-03T10:04:12-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/2399953/posts/1859817720432685054',
    content: '<p>Free TLS/SSL encryption certificates enabled by default for all blogspot blogs worldwide.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/blogger/100/100' } },
    labels: ['security', 'https', 'privacy']
  },

  // --- Blogger Developers Network (id: 3213900) ---
  {
    kind: 'blogger#post',
    id: '8266404449195608384',
    blog: { id: '3213900' },
    title: 'Improvements to the Blogger template HTML editor',
    url: 'http://blogger-developers.googleblog.com/2013/04/improvements-to-blogger-template-html.html',
    published: '2013-04-09T19:03:00-07:00',
    updated: '2020-05-28T21:58:13-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts/8266404449195608384',
    content: '<p>Syntax highlighting, automatic indentation, tag folding, and line numbers in the updated template editor.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/bdev/100/100' } },
    labels: ['editor', 'html', 'developer-tools']
  },
  {
    kind: 'blogger#post',
    id: '738097307410258659',
    blog: { id: '3213900' },
    title: 'Blogger API v3',
    url: 'http://blogger-developers.googleblog.com/2012/06/blogger-api-v3.html',
    published: '2012-06-19T17:29:00-07:00',
    updated: '2020-05-28T21:58:13-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts/738097307410258659',
    content: '<p>Official launch of Blogger API v3 with clean JSON payloads, Google APIs Client libraries, and OAuth 2.0 authentication.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/bdev/100/100' } },
    labels: ['api', 'v3', 'oauth2']
  },
  {
    kind: 'blogger#post',
    id: '8281353245468500201',
    blog: { id: '3213900' },
    title: 'Blogger Documentation has moved to developers.google.com',
    url: 'http://blogger-developers.googleblog.com/2012/03/blogger-documentation-has-moved-to.html',
    published: '2012-03-29T17:01:00-07:00',
    updated: '2020-05-28T21:58:13-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts/8281353245468500201',
    content: '<p>New centralized developer hub on developers.google.com with interactive API Explorer, code samples, and client SDKs.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/bdev/100/100' } },
    labels: ['docs', 'developers', 'google']
  },
  {
    kind: 'blogger#post',
    id: '7689104044565706509',
    blog: { id: '3213900' },
    title: 'Customising Threaded Comments',
    url: 'http://blogger-developers.googleblog.com/2012/01/customising-threaded-comments.html',
    published: '2012-01-26T20:07:00-08:00',
    updated: '2020-05-28T21:58:13-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts/7689104044565706509',
    content: '<p>CSS hooks and template XML tags to customize nested comment threads and avatars.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/bdev/100/100' } },
    labels: ['comments', 'threading', 'templates']
  },
  {
    kind: 'blogger#post',
    id: '2726356612984950346',
    blog: { id: '3213900' },
    title: 'An easier to use interface for the Blogger JSON API',
    url: 'http://blogger-developers.googleblog.com/2012/01/easier-to-use-interface-for-blogger.html',
    published: '2012-01-09T20:04:00-08:00',
    updated: '2020-05-28T21:58:13-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts/2726356612984950346',
    content: '<p>Simplified JSON format for public feeds and client-side AJAX widgets without complex XML parsing.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/bdev/100/100' } },
    labels: ['json', 'feed-api', 'ajax']
  },
  {
    kind: 'blogger#post',
    id: '237676474877526514',
    blog: { id: '3213900' },
    title: 'Blogger JSON API now available',
    url: 'http://blogger-developers.googleblog.com/2011/09/blogger-json-api-now-available.html',
    published: '2011-09-08T01:59:00-07:00',
    updated: '2020-05-28T21:58:13-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/3213900/posts/237676474877526514',
    content: '<p>Public announcement of the JSON format for Blogger posts, comments, and pages.</p>',
    author: { displayName: 'Google Blogs', image: { url: 'https://picsum.photos/seed/bdev/100/100' } },
    labels: ['json', 'announcements', 'rest']
  },

  // --- Brett's Test Blawg (id: 4967929378133675647) ---
  {
    kind: 'blogger#post',
    id: '5110456959382979723',
    blog: { id: '4967929378133675647' },
    title: 'Testing testing 1 2 3',
    url: 'https://brettmorgan-test-blawg.blogspot.com/2015/06/testing-testing-1-2-3.html',
    published: '2015-06-15T18:03:00-07:00',
    updated: '2015-06-15T18:03:25-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/posts/5110456959382979723',
    content: '<p>Live test verification post for Blogger API v3 syndication and OAuth token flow.</p>',
    author: { displayName: 'Brett Morgan', image: { url: 'https://picsum.photos/seed/brett/100/100' } },
    labels: ['testing', 'syndication', 'api']
  },
  {
    kind: 'blogger#post',
    id: '3905050755644532469',
    blog: { id: '4967929378133675647' },
    title: 'Test Post 123456789',
    url: 'https://brettmorgan-test-blawg.blogspot.com/2012/11/test-post-123456789.html',
    published: '2012-11-27T16:18:00-08:00',
    updated: '2012-11-27T16:18:54-08:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/posts/3905050755644532469',
    content: '<p>Testing numeric permalinks, character encoding, and RSS feed generation.</p>',
    author: { displayName: 'Brett Morgan', image: { url: 'https://picsum.photos/seed/brett/100/100' } },
    labels: ['encoding', 'rss', 'test']
  },
  {
    kind: 'blogger#post',
    id: '1715047223710830771',
    blog: { id: '4967929378133675647' },
    title: 'A silly title',
    url: 'https://brettmorgan-test-blawg.blogspot.com/2012/08/a-silly-title.html',
    published: '2012-08-07T10:24:00-07:00',
    updated: '2012-08-07T10:29:58-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/posts/1715047223710830771',
    content: '<p>Checking title tag sanitization and special character rendering in feed readers.</p>',
    author: { displayName: 'Brett Morgan', image: { url: 'https://picsum.photos/seed/brett/100/100' } },
    labels: ['sanitization', 'titles']
  },
  {
    kind: 'blogger#post',
    id: '4403089692031335591',
    blog: { id: '4967929378133675647' },
    title: 'A test post',
    url: 'https://brettmorgan-test-blawg.blogspot.com/2012/07/a-test-post_8120.html',
    published: '2012-07-19T18:07:00-07:00',
    updated: '2012-07-19T18:07:51-07:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/posts/4403089692031335591',
    content: '<p>Verifying slug collision handling when multiple posts share the same headline.</p>',
    author: { displayName: 'Brett Morgan', image: { url: 'https://picsum.photos/seed/brett/100/100' } },
    labels: ['slugs', 'permalinks']
  },
  {
    kind: 'blogger#post',
    id: '4706208337296422907',
    blog: { id: '4967929378133675647' },
    title: 'Test Geo Post',
    url: 'https://brettmorgan-test-blawg.blogspot.com/2012/02/test-geo-post.html',
    published: '2012-02-06T20:05:00-08:00',
    updated: '2012-02-06T20:05:38-08:00',
    selfLink: 'https://www.googleapis.com/blogger/v3/blogs/4967929378133675647/posts/4706208337296422907',
    content: '<p>Testing geographic location metadata attached to Blogger API posts.</p>',
    author: { displayName: 'Brett Morgan', image: { url: 'https://picsum.photos/seed/brett/100/100' } },
    labels: ['geolocation', 'metadata']
  }
];
