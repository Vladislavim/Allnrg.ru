const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, 'assets', 'optimized');
const maxEdge = 1800;
const minBytes = 200 * 1024;
const quality = 62;

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...walk(full));
    else if (/\.(webp|jpe?g|png)$/i.test(item.name)) out.push(full);
  }
  return out;
}

(async () => {
  const files = walk(root);
  const changed = [];
  for (const file of files) {
    const before = fs.statSync(file).size;
    if (before < minBytes || /\.min\.webp$/i.test(file)) continue;

    const image = sharp(file, { animated: false });
    const meta = await image.metadata();
    const shouldResize = Math.max(meta.width || 0, meta.height || 0) > maxEdge;
    const pipeline = image
      .rotate()
      .resize({
        width: shouldResize ? maxEdge : undefined,
        height: shouldResize ? maxEdge : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6 });

    const buffer = await pipeline.toBuffer();
    if (buffer.length < before) {
      const minFile = file.replace(/\.(webp|jpe?g|png)$/i, '.min.webp');
      fs.writeFileSync(minFile, buffer);
      changed.push({
        file: path.relative(__dirname, file).replace(/\\/g, '/'),
        minFile: path.relative(__dirname, minFile).replace(/\\/g, '/'),
        beforeKB: Math.round(before / 1024),
        afterKB: Math.round(buffer.length / 1024),
      });
    }
  }
  const savedKB = changed.reduce((sum, item) => sum + item.beforeKB - item.afterKB, 0);
  const textFiles = [];
  for (const file of fs.readdirSync(__dirname)) {
    if (file.endsWith('.html')) textFiles.push(path.join(__dirname, file));
  }
  for (const dir of ['css', 'js']) {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const item of fs.readdirSync(fullDir)) {
      if (/\.(css|js)$/i.test(item)) textFiles.push(path.join(fullDir, item));
    }
  }
  for (const textFile of textFiles) {
    let text = fs.readFileSync(textFile, 'utf8');
    const beforeText = text;
    for (const item of changed) {
      text = text.split(item.file).join(item.minFile);
      text = text.split(item.file.replace(/\//g, '\\')).join(item.minFile.replace(/\//g, '\\'));
    }
    if (text !== beforeText) fs.writeFileSync(textFile, text, 'utf8');
  }

  console.log(JSON.stringify({ optimized: changed.length, savedKB, changed }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
