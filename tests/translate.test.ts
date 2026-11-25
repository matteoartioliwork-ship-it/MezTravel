import assert from 'node:assert/strict'
import { test } from 'node:test'
import { byteLength, checkText, decodeEntities, QuotaError, readAnswer, translationLanguages } from '../src/translate.ts'

test('mesure la limite en octets', () => {
  assert.equal(byteLength('駅'), 3)
  assert.equal(checkText('a'.repeat(500)), null)
  assert.equal(checkText('a'.repeat(501)), 'tooLong')
  assert.equal(checkText('駅'.repeat(166)), null)
  assert.equal(checkText('駅'.repeat(167)), 'tooLong')
})

test('n’accepte qu’un paragraphe non vide', () => {
  assert.equal(checkText('  \n '), 'empty')
  assert.equal(checkText('une ligne\nune autre'), null)
  assert.equal(checkText('un\n\ndeux'), 'paragraphs')
  assert.equal(checkText('un\r\n  \r\ndeux'), 'paragraphs')
})

test('lit une traduction réussie', () => {
  assert.equal(readAnswer({ responseStatus: 200, quotaFinished: false, responseData: { translatedText: '駅はどこですか。' } }), '駅はどこですか。')
})

test('ne prend jamais un message d’erreur pour une traduction', () => {
  // Réponse réelle observée pour une langue invalide.
  const invalid = { responseStatus: '403', responseData: { translatedText: "'ZZ' IS AN INVALID TARGET LANGUAGE ." } }
  assert.throws(() => readAnswer(invalid), (e) => !(e instanceof QuotaError))
  for (const bad of [null, {}, { responseStatus: 200, responseData: { translatedText: '' } }]) {
    assert.throws(() => readAnswer(bad))
  }
  for (const quota of [
    { responseStatus: 200, quotaFinished: true, responseData: { translatedText: 'x' } },
    { responseStatus: '429', responseData: { translatedText: 'x' } },
    { responseStatus: 200, responseData: { translatedText: 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS' } },
  ]) {
    assert.throws(() => readAnswer(quota), QuotaError)
  }
})

test('remet les caractères codés sans interpréter de code', () => {
  assert.equal(decodeEntities('L&#39;hotel &amp; &quot;bar&quot; &#x99C5; &nope; &#99999999;'), 'L\'hotel & "bar" 駅 &nope; &#99999999;')
})

test('la liste des langues n’a pas de doublon', () => {
  assert.equal(new Set(translationLanguages).size, translationLanguages.length)
  assert.ok(['it', 'en', 'fr', 'ja'].every((code) => translationLanguages.includes(code)))
})
