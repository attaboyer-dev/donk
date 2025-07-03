# Donkhouse 2.0
The greatest poker application ever created.

## Local install

### MacOS
1. Install open-source package manager [brew](https://brew.sh/).
1. Install node version manager: `brew install nvm` 

### Windows
1. Install open-source package manager [Scoop](https://scoop.sh/).
1. Run the following commands after installation:
    ``` powershell
    $ scoop install nvm
    $ scoop install nodejs
    $ scoop install yarn
    ```
1. Restart Powershell, confirm all components are installed successfully:
    ``` powershell
    $ nvm -v
    $ node -v
    $ yarn -v
    ```

## Build and deploy locally
``` bash
$ corepack enable; yarn # Install javascript package manager
$ yarn build
$ yarn be # backend
$ yarn fe # frontend
```
