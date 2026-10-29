import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRobotsTxt, isPathAllowedByRobots } from '../src/services/robots.service.js';

test('Robots.txt Parser: respects User-agent and Disallow rules', () => {
  const robotsTxt = `
User-agent: Googlebot
Disallow: /private/

User-agent: SmallWebReader
Disallow: /blocked-feed.xml
Disallow: /admin/
Allow: /admin/public/

User-agent: *
Disallow: /secret/
`;

  const rules = parseRobotsTxt(robotsTxt);
  assert.equal(rules.length, 3);

  // SmallWebReader agent rules
  assert.equal(isPathAllowedByRobots(rules, '/blocked-feed.xml', 'SmallWebReader'), false);
  assert.equal(isPathAllowedByRobots(rules, '/admin/secret', 'SmallWebReader'), false);
  assert.equal(isPathAllowedByRobots(rules, '/admin/public/test', 'SmallWebReader'), true);
  assert.equal(isPathAllowedByRobots(rules, '/feed.xml', 'SmallWebReader'), true);

  // Wildcard fallback
  assert.equal(isPathAllowedByRobots(rules, '/secret/test', 'OtherAgent'), false);
  assert.equal(isPathAllowedByRobots(rules, '/public/post', 'OtherAgent'), true);
});

test('Robots.txt Parser: allows everything when robots.txt is empty', () => {
  const rules = parseRobotsTxt('');
  assert.equal(isPathAllowedByRobots(rules, '/anything'), true);
});
