## A poker app for the people

NOTE (7/31): WIP, local builds will also need redis setup (pub/sub, game-state store) and docker/postgres (database)

# Local install

- Install open-source package manager: `brew` (https://brew.sh/)
- Install node version manager: `brew install nvm`
- Install javascript package manager: `corepack enable; yarn`

# Build and deploy locally

- Build: `yarn build`
- Run backend: `yarn be`
- Run frontend: `yarn fe`
