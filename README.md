# Status Component

Status change component implementation in Vue.js

## Features of WebApp
* Status component calculates offset to always render inside viewport
* Status component status order is changable by drag and drop functionality, result is stored in localStorage
* Changes to item statuses stored in localstorage
* Seperate pages for projects and tasks

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).


## Project Setup
### Add necesary .env variables
* Create a file called `.env` at the root of the project
* Define the following variables in the file with your appropriate values for it to be able to fetch data from the api 
```
VITE_COMPANY_ID={company id}
VITE_API_KEY={api key}
```
### Install npm packages
```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
