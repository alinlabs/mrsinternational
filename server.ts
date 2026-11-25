import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buatRouterApi } from './src/server/router-express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function jalankanServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Pasang BFF API routes sebelum Vite/static middleware
  app.use('/api', buatRouterApi());

  const modeProduksi = process.env.NODE_ENV === 'production';

  if (!modeProduksi) {
    const { createServer: buatViteServer } = await import('vite');
    const vite = await buatViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const dirDist = path.resolve(__dirname, 'dist');
    app.use(express.static(dirDist));
    app.get('*', (_req, res) => {
      const indexDist = path.join(dirDist, 'index.html');
      if (fs.existsSync(indexDist)) {
        res.sendFile(indexDist);
        return;
      }
      res.status(404).send('Build dist tidak ditemukan. Jalankan npm run build.');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MRs Plan berjalan pada port ${PORT}`);
  });
}

jalankanServer().catch((err) => {
  console.error('Gagal memulai server aplikasi:', err instanceof Error ? err.message : 'Unknown error');
  process.exit(1);
});
