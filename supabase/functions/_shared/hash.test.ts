// Testes unitários de `hash.ts` — execute com:
//   deno test supabase/functions/_shared/hash.test.ts

import { assert, assertEquals, assertNotEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { sha256Hex, generateOtp, constantTimeEquals } from './hash.ts';

Deno.test('sha256Hex — retorna hex de 64 caracteres', async () => {
  const h = await sha256Hex('hello');
  assertEquals(h.length, 64);
  assertEquals(h, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
});

Deno.test('sha256Hex — determinístico para mesma entrada', async () => {
  const a = await sha256Hex('singul-ah');
  const b = await sha256Hex('singul-ah');
  assertEquals(a, b);
});

Deno.test('sha256Hex — diferente para entradas distintas', async () => {
  const a = await sha256Hex('123456');
  const b = await sha256Hex('123457');
  assertNotEquals(a, b);
});

Deno.test('sha256Hex — string vazia produz o hash conhecido', async () => {
  const h = await sha256Hex('');
  assertEquals(h, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

Deno.test('generateOtp — sempre retorna 6 dígitos numéricos', () => {
  for (let i = 0; i < 100; i++) {
    const otp = generateOtp();
    assertEquals(otp.length, 6);
    assert(/^\d{6}$/.test(otp), `OTP "${otp}" não é numérico de 6 dígitos`);
  }
});

Deno.test('generateOtp — cobre o range 000000-999999 razoavelmente', () => {
  // Sanity check: em 1000 amostras, espera-se variação na primeira casa.
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) seen.add(generateOtp()[0]);
  // Esperamos pelo menos 5 dígitos diferentes na primeira casa
  // (probabilisticamente quase impossível falhar com PRNG bem distribuído).
  assert(seen.size >= 5, `Distribuição suspeita: apenas ${seen.size} dígitos vistos na primeira casa`);
});

Deno.test('constantTimeEquals — strings iguais retornam true', () => {
  assertEquals(constantTimeEquals('abc123', 'abc123'), true);
  assertEquals(constantTimeEquals('', ''), true);
});

Deno.test('constantTimeEquals — strings diferentes retornam false', () => {
  assertEquals(constantTimeEquals('abc123', 'abc124'), false);
  assertEquals(constantTimeEquals('abc', 'abcd'), false);
  assertEquals(constantTimeEquals('xxx', 'yyy'), false);
});

Deno.test('constantTimeEquals — comprimento diferente retorna false sem comparar', () => {
  assertEquals(constantTimeEquals('a', 'aaaaaaaaaa'), false);
});
