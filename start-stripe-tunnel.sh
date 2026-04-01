#!/bin/bash
./stripe-cli listen --forward-to localhost:3000/api/webhooks/stripe > stripe.log 2>&1 &
echo $! > stripe.pid
sleep 2
grep -o 'whsec_[a-zA-Z0-9]*' stripe.log > secret.txt
