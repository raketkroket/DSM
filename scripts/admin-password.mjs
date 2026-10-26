// Creates the secrets for the admin login. The password itself is never stored or printed:
// only its scrypt hash, which goes into the environment variable ADMIN_PASSWORD_HASH.
// Usage: npm run admin:wachtwoord   (asks for the password twice, hidden)
// The hash format matches src/lib/server/password.ts.
import { randomBytes, scrypt } from 'node:crypto';
import { stdin, stdout } from 'node:process';

function hashPassword(password, { N = 32768, r = 8, p = 1 } = {}) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, 64, { N, r, p, maxmem: 128 * N * r * 2 }, (error, hash) => {
      if (error) reject(error);
      else resolve(`scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`);
    });
  });
}

// Piped input (no terminal): read all lines once.
let piped = null;
async function pipedLine() {
  if (!piped) {
    let data = '';
    stdin.setEncoding('utf8');
    for await (const chunk of stdin) data += chunk;
    piped = data.split(/\r?\n/);
  }
  return piped.shift() ?? '';
}

function ask(question) {
  if (!stdin.isTTY) {
    stdout.write(question);
    return pipedLine().then((line) => {
      stdout.write('\n');
      return line;
    });
  }
  return new Promise((resolve) => {
    stdout.write(question);
    let answer = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onKey = (key) => {
      if (key === '\u0003') {
        stdout.write('\n');
        process.exit(1);
      }
      if (key === '\r' || key === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', onKey);
        stdout.write('\n');
        resolve(answer);
        return;
      }
      if (key === '\u007f' || key === '\b') {
        answer = answer.slice(0, -1);
        return;
      }
      answer += key;
    };
    stdin.on('data', onKey);
  });
}

const password = await ask('Nieuw wachtwoord voor het beheer (minimaal 12 tekens): ');
if (password.length < 12) {
  console.error('Het wachtwoord moet minimaal 12 tekens lang zijn.');
  process.exit(1);
}
if (password !== (await ask('Herhaal het wachtwoord: '))) {
  console.error('De wachtwoorden zijn niet gelijk.');
  process.exit(1);
}
console.log(`
Zet deze waarden in Vercel → Project → Settings → Environment Variables (Production),
en klik daarna op Redeploy. Deel ze met niemand en zet ze niet in de code.

ADMIN_PASSWORD_HASH=${await hashPassword(password)}
ADMIN_SESSION_SECRET=${randomBytes(32).toString('base64url')}

(ADMIN_SESSION_SECRET hoeft bij een nieuw wachtwoord niet te veranderen. Een nieuw
wachtwoord logt automatisch alle bestaande sessies uit.)`);
