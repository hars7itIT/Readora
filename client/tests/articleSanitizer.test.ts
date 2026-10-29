import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeArticleHtml } from '../src/features/articles/articleSanitizer';

test('articleSanitizer: strips malicious script tags and inline event handlers', () => {
  const dirty = `<div><h1>Article</h1><script>alert("hacked")</script><img src="x" onerror="alert(1)" /><p>Content</p></div>`;
  const clean = sanitizeArticleHtml(dirty);

  assert.ok(!clean.includes('<script>'));
  assert.ok(!clean.includes('onerror'));
  assert.ok(clean.includes('Article'));
  assert.ok(clean.includes('Content'));
});

test('articleSanitizer: strips iframe and embed tags', () => {
  const dirty = `<div><iframe src="https://evil.com"></iframe><embed src="flash.swf" /><p>Safe</p></div>`;
  const clean = sanitizeArticleHtml(dirty);

  assert.ok(!clean.includes('<iframe'));
  assert.ok(!clean.includes('<embed'));
  assert.ok(clean.includes('Safe'));
});
