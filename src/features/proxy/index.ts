import { Request, Response } from 'express';
import { config } from '../../shared/config';
import { getCookieJar } from '../../shared/lib/cookies';

export async function proxyRequest(req: Request, res: Response) {
  const target = req.query.target as string | undefined;
  if (!target) {
    res.status(400).send('Target URL required via ?target=');
    return;
  }

  const url = new URL(target);
  const isDestination = config.destinationServers.includes(url.hostname);

  const headers: Record<string, string> = { ...req.headers } as Record<string, string>;
  delete headers.host;

  if (isDestination) {
    const jar = getCookieJar(url.hostname);
    const cookie = await jar.getCookieString(target);
    if (cookie) {
      headers.cookie = cookie;
    }
  }

  const response = await fetch(target, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method ?? '') ? undefined : JSON.stringify(req.body),
  });

  if (isDestination) {
    const jar = getCookieJar(url.hostname);
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) {
      await Promise.all(setCookies.map((c) => jar.setCookie(c, target)));
    }
  }

  res.status(response.status);
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }
  const text = await response.text();
  res.send(text);
}
