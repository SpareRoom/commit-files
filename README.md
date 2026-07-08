# commit-files
GitHub action to commit files

## Node.js version

This action runs on the GitHub Actions `node24` runtime, and local development is pinned to Node.js 24 via `.nvmrc`.

## Building the action

After you've made the neccesary changes you must build the action for them to useable.

Husky will automatically run this whenever you commit and commit the built changes as well.

However, if you ever want to build the action manually just run `npm run build` which will compile all the JS code into single `index.js` file, inside the `dist` folder.
