cp static/* /var/www
tsc --watch -p ts &
pid1=$!
tailwindcss -i css/input.css -o /var/www/styles.css --watch=always &
pid2=$!
trap "kill $pid1; kill $pid2" SIGTERM   SIGKILL
wait -n $pid1 $pid2
kill $pid1 2>/dev/null
kill $pid2 2>/dev/null
