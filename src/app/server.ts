import express from 'express';
import { Logger } from 'tslog';
import { config } from '../shared/config';
import { proxyRequest } from '../features/proxy';

const logger = new Logger({ name: 'proxy-server' });
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', proxyRequest);

app.listen(config.port, () => {
  logger.info(`Server started on port ${config.port}`);
});
