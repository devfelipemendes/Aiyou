#!/bin/sh

echo NEXT_PUBLIC_API_AIYOU_BASE_URL="" >> .env

echo NEXT_PUBLIC_LARAVEL_API_URL="" >> .env
echo NEXT_PUBLIC_REVERB_APP_KEY="" >> .env
echo NEXT_PUBLIC_REVERB_PORT=443 >> .env
echo NEXT_PUBLIC_REVERB_SCHEME=https >> .env

echo NODE_ENV='staging' >> .env
