# Deploying to AWS Amplify Hosting

The site is static, so Amplify only has to serve the repository. There is no
bundler and no `node_modules`.

## One-time setup

1. Sign in to the AWS console and open **AWS Amplify**.
2. Choose **Create new app** → **Host web app**.
3. Pick **GitHub** and authorise Amplify if you have not already.
4. Choose the repository `bharathsridhar-root/ganesh` and the branch you want to
   publish.
5. Amplify detects `amplify.yml` in the repository root. Leave it as it is —
   it runs `node tools/validate.mjs` and then publishes the files.
6. Choose **Save and deploy**.

The first build takes a couple of minutes, most of it uploading the 14 MB audio
file. Amplify then gives you a URL like
`https://<branch>.<app-id>.amplifyapp.com`.

Every push to that branch redeploys automatically.

## Why the build runs the validator

`assets/data/text.js` pairs each Sanskrit word with its meaning by position. If
an edit adds or removes a word without updating the meanings, the words and their
glosses silently drift apart. `tools/validate.mjs` catches that, and because the
build spec runs it, a mistake fails the deploy instead of reaching the site.

If a build fails with something like

```
l6.14: 10 devanagari tokens but 9 glosses
```

that is the validator, and the message names the line to fix.

## The audio file

`Ganapatyatarvasheersam.mp3` is about 14 MB, which is well inside Amplify's
limits. `amplify.yml` sets a long `Cache-Control` on it and advertises
`Accept-Ranges: bytes`, so the browser can seek into the recording without
downloading all of it first — which is what makes tapping a line in the middle of
the text jump there instantly.

## A custom domain

In the Amplify console, **Hosting** → **Custom domains** → **Add domain**. If the
domain is in Route 53 the DNS records are created for you; otherwise Amplify
shows the CNAME records to add at your registrar. The TLS certificate is issued
and renewed by Amplify.

## Notes

- There are no environment variables and no secrets. Nothing here needs any.
- There are no redirect or rewrite rules to add. The site is a single page; the
  Amplify default of serving `index.html` is all it needs.
- To publish a second branch (a draft, say), connect it in the Amplify console
  and it gets its own URL.
