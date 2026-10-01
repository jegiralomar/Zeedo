# Live Deployment Rule

Always push verified commits directly to the remote repository on `master` (`git push origin master`).
The repository is wired via GitHub Actions (`.github/workflows/deploy.yml`) to automatically build and deploy new containers directly to the production VPS host (`zeedo.bid`).

Whenever completing a feature, bugfix, or enhancement requested by the user:
1. Verify the build (`npm run build` or `npx tsc --noEmit`).
2. Commit the changes cleanly with a descriptive message.
3. Automatically execute `git push origin master` so changes go live immediately without waiting for an extra manual prompt.
