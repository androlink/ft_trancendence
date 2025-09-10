set -bm # without that f***ing line --wait doesn't work in background
tsc --watch -p ts &
pid1=$!
tailwindcss -i css/input.css -o /var/www/styles.css --watch=always &
pid2=$!
wait -n $pid1 $pid2
kill $pid1 2>/dev/null
kill $pid2 2>/dev/null
