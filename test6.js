/* Pruebas de números (bloque NUM de numbers.js) y de verbos por letra: node test6.js */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/numbers.js', 'utf8');
const block = src.slice(src.indexOf('/* NUM:inicio'), src.indexOf('/* NUM:fin */'));
const N = new Function(block + '\nreturn {makeNum, checkNumber, genNumber, numWords, ordWords, ordSuffix, yearWords, NUM_KINDS};')();
let fails = 0;
const eq = (name, a, b) => { if(a === b) console.log('✓', name); else { fails++; console.log('✗', name, '→', JSON.stringify(a), '(esperado', JSON.stringify(b) + ')'); } };
const yes = (name, c) => eq(name, !!c, true);

/* 1) forma recomendada de decir cada tipo */
const say = (k, v) => N.makeNum(k, v).say;
eq('13', say('card', 13), 'thirteen'); eq('30', say('card', 30), 'thirty');
eq('245', say('card', 245), 'two hundred forty-five');
eq('3,500', say('card', 3500), 'three thousand five hundred');
eq('18,250', say('card', 18250), 'eighteen thousand two hundred fifty');
eq('1,500,000', say('card', 1500000), 'one million five hundred thousand');
eq('100', say('card', 100), 'one hundred'); eq('1,000,000', say('card', 1000000), 'one million');
eq('se muestra con comas', N.makeNum('card', 18250).show, '18,250');
eq('1st', say('ord', 1), 'first'); eq('2nd', say('ord', 2), 'second'); eq('3rd', say('ord', 3), 'third');
eq('12th', say('ord', 12), 'twelfth'); eq('21st', say('ord', 21), 'twenty-first'); eq('31st', say('ord', 31), 'thirty-first');
eq('40th', say('ord', 40), 'fortieth'); eq('100th', say('ord', 100), 'one hundredth');
['11th','12th','13th','21st','22nd','23rd','111th'].forEach(s => eq('sufijo ' + s, parseInt(s) + N.ordSuffix(parseInt(s)), s));
eq('1998', say('year', 1998), 'nineteen ninety-eight');
eq('1905', say('year', 1905), 'nineteen oh five');
eq('1900', say('year', 1900), 'nineteen hundred');
eq('1805', say('year', 1805), 'eighteen oh five');
eq('2000', say('year', 2000), 'two thousand');
eq('2001', say('year', 2001), 'two thousand one');
eq('2005', say('year', 2005), 'two thousand five');
eq('2010', say('year', 2010), 'twenty ten');
eq('2026', say('year', 2026), 'twenty twenty-six');
eq('fecha', say('date', '2026-10-15|m'), 'October fifteenth, twenty twenty-six');
eq('fecha en formato EE. UU. (mes primero)', N.makeNum('date', '2026-10-15|s').show, '10/15/2026');
eq('7:15', say('time', '7:15'), 'seven fifteen'); eq('6:30', say('time', '6:30'), 'six thirty');
eq('9:00', say('time', '9:00'), "nine o'clock"); eq('8:45', say('time', '8:45'), 'eight forty-five');
eq('10:05', say('time', '10:05'), 'ten oh five'); eq('12:00', say('time', '12:00'), "twelve o'clock");
eq('$4.99', say('price', '4.99'), 'four ninety-nine'); eq('$25', say('price', '25.00'), 'twenty-five dollars');
eq('$0.75', say('price', '0.75'), 'seventy-five cents'); eq('$1.05', say('price', '1.05'), 'one oh five');
eq('$1,200 se muestra', N.makeNum('price', '1200.00').show, '$1,200');

/* 2) lo que suele devolver el micrófono, o lo que escribes */
const ok = (k, v, text) => N.checkNumber(N.makeNum(k, v), text);
yes('"1998" vale para 1998', ok('year', 1998, '1998'));
yes('"nineteen ninety eight" vale', ok('year', 1998, 'Nineteen ninety eight'));
yes('"one thousand nine hundred ninety-eight" vale (el micrófono no distingue la forma)', ok('year', 1998, 'one thousand nine hundred ninety-eight'));
eq('"1989" NO vale para 1998', ok('year', 1998, '1989'), false);
yes('"October 15th 2026" vale', ok('date', '2026-10-15|m', 'October 15th, 2026'));
yes('"October fifteenth twenty twenty-six" vale', ok('date', '2026-10-15|m', 'October fifteenth, twenty twenty-six'));
yes('"the fifteenth of October 2026" vale', ok('date', '2026-10-15|s', 'the fifteenth of October 2026'));
eq('"October 16 2026" NO vale', ok('date', '2026-10-15|m', 'October 16 2026'), false);
yes('"7:45" vale', ok('time', '7:45', '7:45'));
yes('"a quarter to eight" vale para 7:45', ok('time', '7:45', 'a quarter to eight'));
yes('"half past six" vale para 6:30', ok('time', '6:30', 'half past six'));
yes('"9 o\'clock" vale para 9:00', ok('time', '9:00', "9 o'clock"));
yes('"$4.99" vale', ok('price', '4.99', '$4.99'));
yes('"four dollars and ninety-nine cents" vale', ok('price', '4.99', 'four dollars and ninety-nine cents'));
yes('"twelve hundred dollars" vale para $1,200', ok('price', '1200.00', 'twelve hundred dollars'));
yes('"3500" y "thirty-five hundred" valen', ok('card', 3500, '3500') && ok('card', 3500, 'thirty-five hundred'));
yes('"two hundred and forty-five" vale', ok('card', 245, 'two hundred and forty-five'));
yes('"21st" y "twenty first" valen', ok('ord', 21, '21st') && ok('ord', 21, 'twenty first'));
eq('"thirty" NO vale para 13', ok('card', 13, 'thirty'), false);

/* 3) el generador siempre da números válidos y con su propia forma aceptada */
let s = 3; const r = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
let bad = 0;
for(let i = 0; i < 2000; i++){ const k = Object.keys(N.NUM_KINDS)[i % 6]; const it = N.genNumber(k, r); if(!it || !it.say || !N.checkNumber(it, it.say) || !N.checkNumber(it, it.show)) { bad++; if(bad < 4) console.log('  inválido:', k, it && it.show, it && it.say); } }
eq('2000 números generados: todos se aceptan con su forma y su cifra', bad, 0);

/* 4) verbos por letra */
eval(fs.readFileSync(__dirname + '/verbs.js', 'utf8').replace(/^const /gm, 'var '));
const verbs = IRREG.trim().split('\n').map(l => l.split('|')[0]);
const count = L => verbs.filter(v => v[0].toUpperCase() === L).length;
eq('S tiene 18 verbos irregulares', count('S'), 18); eq('B tiene 8', count('B'), 8); eq('E tiene 1', count('E'), 1); eq('A no tiene', count('A'), 0);
eq('quiz de S: 6 verbos × 2 = 12 preguntas', Math.min(12, Math.min(6, count('S')) * 2), 12);
eq('quiz de E: 1 verbo × 2 = 2 preguntas', Math.min(12, Math.min(6, count('E')) * 2), 2);

console.log(fails ? `\n${fails} prueba(s) fallaron` : '\nTodas las pruebas pasan');
process.exit(fails ? 1 : 0);
