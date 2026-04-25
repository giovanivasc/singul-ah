// Testes unitários de `net.ts` — execute com:
//   deno test supabase/functions/_shared/net.test.ts

import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { firstForwardedIp, maskEmail, generateUrlSafeToken } from './net.ts';

// ----- firstForwardedIp ------------------------------------------------------

Deno.test('firstForwardedIp — IP único retorna ele mesmo', () => {
  assertEquals(firstForwardedIp('181.191.14.28'), '181.191.14.28');
});

Deno.test('firstForwardedIp — múltiplos IPs retorna o primeiro', () => {
  assertEquals(
    firstForwardedIp('181.191.14.28,181.191.14.28, 13.248.114.168'),
    '181.191.14.28',
  );
});

Deno.test('firstForwardedIp — remove espaços ao redor', () => {
  assertEquals(firstForwardedIp('   181.191.14.28   '), '181.191.14.28');
  assertEquals(firstForwardedIp(' 1.2.3.4 , 5.6.7.8'), '1.2.3.4');
});

Deno.test('firstForwardedIp — null/undefined/vazio retorna null', () => {
  assertEquals(firstForwardedIp(null), null);
  assertEquals(firstForwardedIp(undefined), null);
  assertEquals(firstForwardedIp(''), null);
  assertEquals(firstForwardedIp('   '), null);
});

Deno.test('firstForwardedIp — IPv6 também é tratado', () => {
  assertEquals(firstForwardedIp('2001:db8::1, 1.2.3.4'), '2001:db8::1');
});

// ----- maskEmail -------------------------------------------------------------

Deno.test('maskEmail — formato típico', () => {
  assertEquals(maskEmail('joao@exemplo.com'), 'j***@exemplo.com');
  assertEquals(maskEmail('giovanivasc@gmail.com'), 'g**********@gmail.com');
});

Deno.test('maskEmail — local de uma única letra ainda tem ao menos um asterisco', () => {
  // "a@x.com" → "a*@x.com" (Math.max(1, 0) = 1 garante asterisco).
  assertEquals(maskEmail('a@x.com'), 'a*@x.com');
});

Deno.test('maskEmail — entrada inválida retorna ***', () => {
  assertEquals(maskEmail(null), '***');
  assertEquals(maskEmail(undefined), '***');
  assertEquals(maskEmail(''), '***');
  assertEquals(maskEmail('semarroba.com'), '***');
});

Deno.test('maskEmail — domínio é preservado integralmente', () => {
  assertEquals(maskEmail('teste@castanhal.ufpa.br'), 't****@castanhal.ufpa.br');
});

// ----- generateUrlSafeToken --------------------------------------------------

Deno.test('generateUrlSafeToken — comprimento depende dos bytes solicitados', () => {
  const t32 = generateUrlSafeToken(32);
  const t16 = generateUrlSafeToken(16);
  // base64 de N bytes tem ceil(N/3)*4 caracteres; sem padding ignoramos os '='.
  // 32 bytes → 44 chars com padding → 43 sem '='.
  assert(t32.length >= 42 && t32.length <= 44, `len32 inesperado: ${t32.length}`);
  assert(t16.length >= 21 && t16.length <= 24, `len16 inesperado: ${t16.length}`);
});

Deno.test('generateUrlSafeToken — usa apenas caracteres URL-safe', () => {
  const t = generateUrlSafeToken(32);
  assert(/^[A-Za-z0-9_-]+$/.test(t), `Token contém caractere não URL-safe: ${t}`);
});

Deno.test('generateUrlSafeToken — extremamente improvável de colidir', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) seen.add(generateUrlSafeToken(32));
  assertEquals(seen.size, 1000); // 256 bits → colisão é praticamente zero
});

Deno.test('generateUrlSafeToken — default é 32 bytes', () => {
  const t = generateUrlSafeToken();
  assert(t.length >= 42 && t.length <= 44, `default len inesperado: ${t.length}`);
});
