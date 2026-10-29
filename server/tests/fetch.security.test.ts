import test from 'node:test';
import assert from 'node:assert/strict';
import { safeFetch } from '../src/services/safeFetch.service.js';

test('SSRF Defense: rejects localhost hostname', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('http://localhost/feed.xml');
    },
    /Local and private hostnames are not allowed|Local hostnames are not allowed/i
  );
});

test('SSRF Defense: rejects IPv4 loopback (127.0.0.1)', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('http://127.0.0.1/feed.xml');
    },
    /Private or reserved IP addresses are not allowed/i
  );
});

test('SSRF Defense: rejects IPv4 private subnets (10.0.0.1, 192.168.1.1)', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('http://10.0.0.1/admin');
    },
    /Private or reserved IP addresses are not allowed/i
  );

  await assert.rejects(
    async () => {
      await safeFetch('http://192.168.1.1/secret');
    },
    /Private or reserved IP addresses are not allowed/i
  );
});

test('SSRF Defense: rejects cloud metadata IP (169.254.169.254)', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('http://169.254.169.254/latest/meta-data');
    },
    /Private or reserved IP addresses are not allowed/i
  );
});

test('SSRF Defense: rejects non-standard ports (e.g. 8443, 8080, 22)', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('https://example.com:8443');
    },
    /Only standard HTTP\/HTTPS ports/i
  );

  await assert.rejects(
    async () => {
      await safeFetch('http://127.0.0.1:8080');
    },
    /Only standard HTTP\/HTTPS ports/i
  );
});

test('SSRF Defense: rejects embedded credentials in URL', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('https://admin:secret@example.com/feed');
    },
    /URLs containing credentials are not allowed/i
  );
});

test('SSRF Defense: rejects non-HTTP schemes (file:, ftp:, data:)', async () => {
  await assert.rejects(
    async () => {
      await safeFetch('file:///etc/passwd');
    },
    /Only HTTP and HTTPS URLs are allowed/i
  );

  await assert.rejects(
    async () => {
      await safeFetch('ftp://example.com/feed.xml');
    },
    /Only HTTP and HTTPS URLs are allowed/i
  );
});
