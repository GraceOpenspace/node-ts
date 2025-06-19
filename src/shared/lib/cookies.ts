import { CookieJar } from 'tough-cookie';

const jars = new Map<string, CookieJar>();

export function getCookieJar(host: string): CookieJar {
  let jar = jars.get(host);
  if (!jar) {
    jar = new CookieJar();
    jars.set(host, jar);
  }
  return jar;
}
