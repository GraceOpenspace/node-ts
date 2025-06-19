import express from 'express';
import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Logger } from 'tslog';

const logger = new Logger({ name: 'proxy-server' });
const PORT = Number(process.env.PORT) || 3003;
const connection = { host: '127.0.0.1', port: 6379 };
const requestQueue = new Queue('requests', { connection });
const queueEvents = new QueueEvents('requests', { connection });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', async (req, res) => {
  const target = req.query.target as string | undefined;
  if (!target) {
    res.status(400).send('Target URL required via ?target=');
    return;
  }

  const job = await requestQueue.add('proxy', {
    method: req.method,
    target,
    headers: req.headers,
    body: req.body,
  });

  try {
    const result = await job.waitUntilFinished(queueEvents);
    res.status(result.status).set(result.headers).send(result.body);
  } catch (err) {
    logger.error('Job processing failed', err);
    res.status(500).send('Proxy error');
  }
});

new Worker(
  'requests',
  async (job: Job) => {
    await new Promise((r) => setTimeout(r, 1000));
    const { method, target, headers, body } = job.data as {
      method: string;
      target: string;
      headers: Record<string, string>;
      body: unknown;
    };

    const sanitizedHeaders: Record<string, string> = { ...headers };
    delete sanitizedHeaders['fingerprint'];
    delete sanitizedHeaders['ip'];
    delete sanitizedHeaders['x-forwarded-for'];

    sanitizedHeaders['host'] = new URL(target).host;

    const response = await fetch(target, {
      method,
      headers: sanitizedHeaders,
      body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: text,
    };
  },
  { connection },
).on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
