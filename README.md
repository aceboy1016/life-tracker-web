# ⏱️ LifeTracker (Web)

最後にやった日を記録し、経過日数を一覧で確認できるアプリ。Next.js + Firebase、Vercel にデプロイ。

## 開発

```bash
npm install
npm run dev
```

`.env.local` に Firebase の Web 設定（`NEXT_PUBLIC_FIREBASE_*`）を入れてください。

## 通知（毎朝 8:00 ごろのまとめ通知）

1週間以上やっていない項目があるユーザーに、毎朝 8:00（JST）ごろ Web Push で 1 通送ります。
スマホではホーム画面に追加したアプリから「🔔 → 通知オン」で有効になります（iPhone は iOS 16.4 以降・ホーム画面に追加が必須）。

### 必要な環境変数（Vercel → Settings → Environment Variables）

| 変数 | 取得場所 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase コンソール → プロジェクトの設定 → Cloud Messaging → ウェブプッシュ証明書 →「鍵ペアを生成」した公開鍵 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase コンソール → プロジェクトの設定 → サービスアカウント →「新しい秘密鍵を生成」で落ちる JSON の中身を 1 行で貼り付け |
| `CRON_SECRET` | 任意のランダム文字列（例: `openssl rand -hex 32`）。Vercel Cron が自動で `Authorization` ヘッダーに付けます |

設定後に再デプロイしてください。送信は `vercel.json` の Cron（`0 23 * * *` UTC = 8:00 JST）が `/api/cron/daily-digest` を呼びます。

### 仕組み

- `public/sw.js` — プッシュを受けて通知を表示する Service Worker
- `src/lib/notifications.ts` — 通知の許可・FCM トークン取得（`users/{uid}/fcmTokens/{token}` に保存）
- `src/app/api/cron/daily-digest` — 毎朝のまとめ通知を送信（無効になったトークンは自動削除）
- `src/app/api/notifications/test` — 設定画面の「テスト通知を送る」
