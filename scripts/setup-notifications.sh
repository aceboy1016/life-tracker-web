#!/usr/bin/env bash
# Sets the environment variables push notifications need on Vercel (production) and redeploys.
#
# Before running, get two things from the Firebase console (project lifetracker-dc521):
#   1. VAPID public key:
#      https://console.firebase.google.com/project/lifetracker-dc521/settings/cloudmessaging
#      → ウェブプッシュ証明書 →「鍵ペアを生成」→ 表示された鍵をコピー
#   2. Service account JSON:
#      https://console.firebase.google.com/project/lifetracker-dc521/settings/serviceaccounts/adminsdk
#      →「新しい秘密鍵を生成」→ JSON ファイルがダウンロードされる
#
# Usage: ./scripts/setup-notifications.sh ~/Downloads/lifetracker-dc521-firebase-adminsdk-xxxx.json
set -euo pipefail
cd "$(dirname "$0")/.."

SA_FILE="${1:-}"
if [ ! -f "$SA_FILE" ]; then
    echo "使い方: ./scripts/setup-notifications.sh <サービスアカウントJSONのパス>"
    exit 1
fi
command -v vercel >/dev/null || { echo "Vercel CLI が見つかりません（npm i -g vercel）"; exit 1; }

[ -f .vercel/project.json ] || vercel link --yes --project life-tracker-web

read -rp "VAPID 公開鍵を貼り付けて Enter: " VAPID_KEY
[ -n "$VAPID_KEY" ] || { echo "VAPID 公開鍵が空です"; exit 1; }

# $3: "config" for values meant to be public (the VAPID public key is sent to browsers),
# "secret" for credentials.
set_env() {
    vercel env rm "$1" production --yes >/dev/null 2>&1 || true
    printf '%s' "$2" | vercel env add "$1" production --type "$3" >/dev/null
    echo "✓ $1"
}

set_env NEXT_PUBLIC_FIREBASE_VAPID_KEY "$VAPID_KEY" config
set_env FIREBASE_SERVICE_ACCOUNT "$(tr -d '\n' < "$SA_FILE")" secret
set_env CRON_SECRET "$(openssl rand -hex 32)" secret

echo "本番に再デプロイします…"
vercel deploy --prod
echo "完了。アプリの「設定」タブで通知をオンにして、テスト通知を送ってみてください。"
