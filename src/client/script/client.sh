tsc --watch -p ts &
pid1=$!
tailwindcss -i css/input.css -o /var/www/styles.css --watch &
pid2=$!
wait -n $pid1 $pid2
kill $pid1 2>/dev/null
kill $pid2 2>/dev/null
