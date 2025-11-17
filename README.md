# 座標変換ツール

GeoJSON / TopoJSON ファイルをアップロードして、異なる座標系間で座標を変換するWebアプリケーションです。Proj4jsを使用してブラウザ内で座標変換を実行し、API 不要で高速に処理します。

## 機能

- 📁 **ファイルアップロード**: GeoJSON / TopoJSON に対応
- 🔍 **座標系自動検出**: ファイルから座標系情報を自動抽出
- 🔄 **座標系間の変換**: 複数座標の一括変換（数万座標も瞬時）
- 🔀 **座標系の入れ替え**: 変換前後の座標系を簡単に交換
- 📥 **ダウンロード**: 変換済みのGeoJSONをダウンロード
- ⚡ **ブラウザ内処理**: API 不要、オフライン対応、超高速

## セットアップ

### 1. 必要な環境

- Node.js (v14以上)
- npm

### 2. インストール

```bash
# パッケージをインストール
npm install
```

### 3. サーバー起動

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセス

## 使い方

### 基本的な流れ

1. **ファイルをアップロード**
   - ファイルをドラッグ&ドロップまたは選択ボタンでアップロード
   - GeoJSON または TopoJSON に対応

2. **座標系が自動検出される**
   - ファイルに座標系情報（CRS）が含まれている場合、自動抽出
   - 「変換前の座標系」に自動設定

3. **変換後の座標系を選択**
   - 検索欄から目的の座標系を探す
   - 例: "EPSG:4326", "Web Mercator" など

4. **変換ボタンをクリック**
   - 座標を変換
   - 結果をプレビュー

5. **結果をダウンロード（GeoJSONの場合）**
   - 変換されたGeoJSONをダウンロード
   - ファイル名に出力座標系コードが付加

## 対応座標系の例

| コード | 名前 | 用途 |
|--------|------|------|
| EPSG:4326 | WGS 84 | 全世界共通（GPS）|
| EPSG:3857 | Web Mercator | Web地図 |
| EPSG:4301 | Tokyo Datum | 日本（旧） |
| EPSG:2451 | JGD2000 | 日本 |
| EPSG:6670 | JGD2011 | 日本（最新） |
| EPSG:2154 | Lambert 93 | フランス |
| EPSG:32633 | WGS 84 / UTM Zone 33N | ドイツ |

詳細な座標系一覧は [EPSG.io](https://epsg.io) を参照

## ファイル形式

### GeoJSON
```json
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": { "name": "EPSG:4326" }
  },
  "features": [...]
}
```

### TopoJSON
```json
{
  "type": "Topology",
  "arcs": [...],
  "objects": {...}
}
```

## セキュリティ

- **ブラウザ内処理**: 全ての座標変換はブラウザ内で実行
- **外部API 不要**: インターネット接続なしで動作可能
- **データプライバシー**: 座標データはサーバーに送信されません

## トラブルシューティング

### npm: command not found
Node.jsがインストールされていません。[Node.js公式](https://nodejs.org)からインストール

### ファイルから座標系が検出されない
- GeoJSONの `crs` プロパティを確認
- EPSG形式で記述されているか確認（例: "EPSG:4326"）
- TopoJSONは座標系情報を含まないことが多いため、手動選択が必要

### 座標変換エラー
- 指定した座標系コード（EPSG:XXXX）が正しいか確認
- ブラウザの開発者ツール（F12）でコンソールエラーを確認

### ポート3000がすでに使われている
別のポート番号を指定：
```bash
PORT=3001 npm start
```

## 開発

```bash
# サーバーの再起動不要で開発
npm start

# ブラウザで http://localhost:3000 にアクセス
```

### ファイル構成
```
.
├── server.js           # Node.js サーバー（静的ファイルの提供のみ）
├── index.html          # UIマークアップ
├── style.css           # スタイル
├── script.js           # フロントエンドロジック（Proj4jsで座標変換）
├── package.json        # 依存パッケージ
├── .gitignore          # Git除外ファイル
└── README.md           # このファイル
```

## ライセンス

MIT License

## 参考リンク

- [Proj4js](https://proj4js.org/)
- [EPSG Database](https://epsg.io)
- [GeoJSON仕様](https://tools.ietf.org/html/rfc7946)
- [TopoJSON仕様](https://github.com/topojson/topojson-specification)
