# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-12-31

### Changed
- **認証クライアントのリファクタリング対応**
  - `dataviz-auth-client.js` をリファクタリング済みバージョンに更新
  - グローバル変数名を `window.supabase` から `window.datavizSupabase` に変更
  - Web Component を標準の Custom Elements API (`DatavizGlobalHeader extends HTMLElement`) に変更
  - 認証フローを簡素化（フォールバックチェックを削除）
  - デバッグモード (`?auth_debug`) のサポートを追加

### Added
- README.md に認証クライアントに関するドキュメントを追加
  - リファクタリング内容の詳細説明
  - デバッグモードの使用方法
  - ファイル構成の更新
- CHANGELOG.md を追加

### Technical Details
- **グローバル変数**: `window.datavizSupabase` で Supabase クライアントにアクセス可能
- **Web Component**: `<dataviz-header>` カスタムエレメントが自動的に描画される
- **デバッグモード**: URL に `?auth_debug` を追加することで認証リダイレクトを抑制
- **互換性**: 既存の CSV フォーマッター機能には影響なし

## [1.0.0] - 2025-12-30

### Added
- 初回リリース
- CSV ファイルの緯度経度フォーマット変換機能
  - 1列形式 ⇄ 2列形式の相互変換
  - 小数点以下の桁数調整
  - ドラッグ&ドロップ対応
  - データプレビュー機能
- Papa Parse を使用した CSV パース
- ブラウザ内処理（オフライン対応）
- Node.js + Express による静的ファイル配信
