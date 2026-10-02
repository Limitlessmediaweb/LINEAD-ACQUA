#!/usr/bin/env bash
# Lighthouse mobile: bash scripts/lh.sh [path] [nome]
p=${1:-/}; n=${2:-home}
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx --yes lighthouse "http://localhost:3211$p" --form-factor=mobile ${LH_EXTRA} --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new" --output=json --output-path="screenshots/lighthouse/$n-mobile.json" --quiet >/dev/null 2>&1
node -e "
const r=require('./screenshots/lighthouse/$n-mobile.json');const c=r.categories;console.log('$n', Object.keys(c).map(k=>k+' '+Math.round(c[k].score*100)).join(' | '));const a=r.audits;console.log(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','total-byte-weight'].map(k=>k.split('-').map(w=>w[0]).join('')+' '+a[k].displayValue).join(' | '));
for(const i of (a['mainthread-work-breakdown'].details.items)) process.stdout.write(i.groupLabel+' '+Math.round(i.duration)+'; ');console.log();"
