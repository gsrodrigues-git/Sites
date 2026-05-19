# TechStore

Site estatico de e-commerce premium para apresentacao e teste publico.

## Preview para testes

Quando o GitHub Pages terminar a publicacao automatica, o site ficara disponivel em:

https://gsrodrigues-git.github.io/Sites/

Repositorio publico:

https://github.com/gsrodrigues-git/Sites

## Como funciona a publicacao

- Todo envio para a branch `main` dispara o GitHub Actions.
- O fluxo em `.github/workflows/pages.yml` publica os arquivos estaticos no GitHub Pages.
- O arquivo `.nojekyll` evita que o GitHub trate nomes de arquivos como configuracao Jekyll.

## Teste local

Abra `index.html` no navegador ou use a extensao Live Server do VS Code. Este projeto ja esta configurado para usar a porta `5501`.
