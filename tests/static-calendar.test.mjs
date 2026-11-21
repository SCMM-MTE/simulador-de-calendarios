import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

process.env.TZ = 'Europe/Madrid';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const definition = (name) => {
    const start = html.indexOf(`const ${name} =`);
    assert.notEqual(start, -1, name);
    const end = html.indexOf('\nconst ', start + 1);
    return html.slice(start, end);
};
const helpers = runInNewContext([
    'const MS_PER_DAY = 86400000;',
    'const isBaseRestForGroup = (date, dates) => dates.includes(date.getDate());',
    ...['civilDayOffset', 'getAdjustedPfaRangeForScenario', 'isVacationForScenario',
        'countVacationOverlap', 'newYearsEvePapQuota'].map(definition),
    '({ getAdjustedPfaRangeForScenario, countVacationOverlap, newYearsEvePapQuota })',
].join('\n'), { Date });

test('un PFA desplazado a después del cambio de hora conserva todos sus días', () => {
    const { pfaStart, pfaEnd } = helpers.getAdjustedPfaRangeForScenario(
        2027, { start: { m: 2, d: 27 }, end: { m: 3, d: 23 } }, [27, 28],
    );
    assert.equal(pfaStart, +new Date(2027, 2, 29));
    assert.equal(pfaEnd, +new Date(2027, 3, 25));
});

test('el PFA del 11 al 31 de diciembre conserva su final si el inicio se adelanta', () => {
    const { pfaStart, pfaEnd } = helpers.getAdjustedPfaRangeForScenario(
        2027, { start: { m: 11, d: 11 }, end: { m: 11, d: 31 } }, [11],
    );
    assert.equal(pfaStart, +new Date(2027, 11, 10));
    assert.equal(pfaEnd, +new Date(2027, 11, 31));
});

test('el solapamiento incluye el último día civil y cuenta una sola vez cada fecha', () => {
    const start = new Date(2027, 2, 27);
    const end = new Date(2027, 2, 29);
    const ranges = { summerStart: +start, summerEnd: +end, pfaStart: +end, pfaEnd: +end };
    assert.equal(helpers.countVacationOverlap(start, end, ranges), 3);
    assert.equal(+start, +new Date(2027, 2, 27));
});

test('el cupo especial de Nochevieja se limita a la vigencia documentada', () => {
    const quota = helpers.newYearsEvePapQuota;
    assert.equal(quota(2027, 11, 31, 5), 55);
    assert.equal(quota(2027, 11, 31, 6), 55);
    assert.equal(quota(2027, 11, 31, 0), 37);
    assert.equal(quota(2027, 11, 30, 4), null);
    assert.equal(quota(2028, 11, 31, 0), null);
});
