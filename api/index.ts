import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { buatRouterApi } from '../src/server/router-express';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use('/api', buatRouterApi());

export function normalisasiUrlVercelApi(rawUrl: string): string {
  const url = rawUrl || '/api';
  const parsed = new URL(url, 'https://mrs.international.my.id');
  const routeParam = parsed.searchParams.get('__route');
  if (routeParam !== null) {
    parsed.searchParams.delete('__route');
    const cleanRoute = routeParam.replace(/^\/+/, '');
    const qs = parsed.searchParams.toString();
    return `/api/${cleanRoute}${qs ? `?${qs}` : ''}`;
  }
  return `${parsed.pathname}${parsed.search}`;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url) {
    req.url = normalisasiUrlVercelApi(req.url);
  }
  return app(req, res);
}
