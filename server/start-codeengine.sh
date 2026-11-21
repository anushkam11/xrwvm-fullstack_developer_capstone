#!/usr/bin/env bash
set -euo pipefail

children=()
cleanup() {
    if (( ${#children[@]} )); then
        kill -TERM "${children[@]}" 2>/dev/null || true
        wait || true
    fi
}
trap cleanup EXIT
trap 'exit 143' TERM INT

export DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-$(python -c 'import secrets; print(secrets.token_urlsafe(48))')}"
mkdir -p /tmp/capstone-mongo

mongod --bind_ip 127.0.0.1 --dbpath /tmp/capstone-mongo --wiredTigerCacheSizeGB 0.25 &
children+=("$!")
PORT=3030 node database/app.js &
children+=("$!")
gunicorn --chdir djangoapp/microservices app:app --bind 127.0.0.1:5050 &
children+=("$!")

for url in "$backend_url/fetchDealers/Kansas" "$sentiment_analyzer_url/analyze/Fantastic%20services"; do
    timeout 60 bash -c 'until curl --silent --fail --max-time 3 "$1" >/dev/null; do sleep 1; done' _ "$url"
done

python manage.py migrate --noinput
python manage.py shell -c 'from djangoapp.populate import initiate; initiate()'
gunicorn djangoproj.wsgi:application --bind "0.0.0.0:${PORT:-8080}" &
children+=("$!")

# Make Code Engine restart the container if an essential process exits.
wait -n "${children[@]}"
