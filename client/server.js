import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist');

// Serve static assets from Vite build directory
app.use(express.static(DIST_PATH));

// SPA history API fallback: return index.html for all non-asset requests
app.use((req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Link Click Frontend listening on port ${PORT}`);
});
