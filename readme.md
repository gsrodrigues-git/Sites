# TechStore

Site estatico de e-commerce premium para apresentacao e teste publico.

## Preview para testes

Preview publico imediato:

https://raw.githack.com/gsrodrigues-git/Sites/main/index.html

Quando o GitHub Pages for ativado nas configuracoes do repositorio, o site tambem ficara disponivel em:

https://gsrodrigues-git.github.io/Sites/

Repositorio publico:

https://github.com/gsrodrigues-git/Sites

## Como funciona a publicacao

- Todo envio para a branch `main` dispara o GitHub Actions.
- O fluxo em `.github/workflows/pages.yml` publica os arquivos estaticos no GitHub Pages.
- O arquivo `.nojekyll` evita que o GitHub trate nomes de arquivos como configuracao Jekyll.
- A primeira ativacao do GitHub Pages pode exigir confirmacao manual em `Settings > Pages`, usando a fonte `GitHub Actions`.

## Teste local

Abra `index.html` no navegador ou use a extensao Live Server do VS Code. Este projeto ja esta configurado para usar a porta `5501`.
