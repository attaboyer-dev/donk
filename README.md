## A poker app for the people

NOTE (7/31): WIP, local builds will also need redis setup (pub/sub, game-state store) and docker/postgres (database)

# Local install

- Install open-source package manager: `brew` (https://brew.sh/)
- Install node version manager: `brew install nvm`
- Install javascript package manager: `corepack enable; yarn`
- Install docker runtime

# Build and deploy locally

- Build: `yarn build`
- Run database: `yarn db`
- Run backend: `yarn be`
- Run dealer: `yarn dealer`
- Run frontend: `yarn fe`
