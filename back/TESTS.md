# TESTS AUTOMATISES

## ce document décrit la mise en place des tests unitaires, réalisé avec Jest.

## Contexte technique
Le projet est écrit en Javascript ESM natif (import / export).
Jest n'active pas l'ESM par défaut: la config ci-dessous le force via --experimental-vm-modules, sans transpilation Babel ( transform: {})

Chaque partie du projet a sa propre configuration Jest independante:
back/jest.config.js
front/jest.config.js

## Prerequis
- Node.js 18+ (ESM + --experimental-vm-modules, necessite un Node relativement recent)
- npm

## Installation
a faire une fois dans chaque dossier (back & front):
npm install

npm install lit devDependencies dans package.json et installe Jest automatiquement.

## Lancer les tests
npm test

## Convention pour ajouter un nouveau test
1- creer un fichier nom-du-module.test.js dans le dossier __tests__
2- importer la ou les fonctions à tester avec import 
3- structurer avec 'describe("nomDeLaFonction", () => { ... })'  puis un 'test("ce que ça doit faire", () => { ... })' par cas.
4- lancer npm test

## Limites/hors perimetre
ces tests couvrent uniquement des fonctions pures unitaires.
Ne sont pas encore testes:
1- les routes/controllers
2- les appels réseaux du front (fetch)
3- le rendu DOM/UI du front
