const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, '.')));

// サーバー起動
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║  座標変換ツール - サーバー起動       ║
╚═══════════════════════════════════════╝

🚀 Server running at:  http://localhost:${PORT}
📍 機能:               Proj4js を使用したブラウザ内座標変換
📊 特徴:               API 不要・高速・オフライン対応

    `);
});
