# KRINDAL Executive Office

Site institucional estático em inglês, português do Brasil e espanhol. A versão em inglês fica na raiz. As versões em português e espanhol ficam em `pt-br/` e `es/`. Cada página tem conteúdo e metadados no HTML, com links equivalentes no seletor de idiomas. O seletor também guarda a preferência para visitas à URL inicial.

A KRINDAL é uma boutique independente de suporte executivo, estratégico e operacional para fundadores, CEOs e líderes. O site apresenta seus serviços, metodologia e canais de contato.

## Tecnologias e estrutura

- HTML5 estático e acessível em inglês, português do Brasil e espanhol.
- CSS modular com Grid e Flexbox, e JavaScript vanilla em módulos.
- Node.js para regenerar o HTML e os metadados. As páginas geradas são versionadas e a hospedagem serve os arquivos já prontos.
- Páginas em inglês na raiz e traduções em `pt-br/` e `es/`. Conteúdo em `locales/`, estilos em `css/`, comportamento em `js/` e recursos visuais em `assets/`.
- `build.mjs` contém os modelos de página. `site.json` define a URL pública usada nos metadados.


## Executar no VS Code

1. Abra esta pasta no VS Code e inicie um terminal na raiz.
2. Para visualizar os arquivos já gerados, execute `python -m http.server 8000 --bind 127.0.0.1` e acesse `http://127.0.0.1:8000/`. Também é possível usar um servidor estático do VS Code.
3. Para editar conteúdo, altere os arquivos de `locales/`. Altere modelos em `build.mjs`, estilos em `css/` e interações em `js/`.
4. Execute `node build.mjs` com Node.js 20+ após editar o conteúdo, os modelos ou `site.json`. Versione os HTMLs gerados, `robots.txt` e `sitemap.xml` junto com as fontes. O gerador usa apenas módulos nativos do Node.

## Configuração para lançamento

| Arquivo | Campo | Uso |
| --- | --- | --- |
| `site.json` | `siteUrl` | URL HTTPS definitiva com o subdiretório do repositório, se houver. Após gerar novamente, habilita canonical, hreflang, imagens sociais absolutas, sitemap e base da 404. |
| `js/config.js` | `formEndpoint` | URL HTTPS pública do provedor de formulário. Deve aceitar POST multipart, permitir a origem do site com CORS e retornar 2xx somente após aceitar a solicitação. |
| `js/config.js` | `bookingUrl` | Agenda oficial. Enquanto estiver vazia, os CTAs abrem o formulário de contato. |
| `js/config.js` | `email`, `whatsappUrl`, `linkedInUrl` | Canais públicos exibidos no contato e no rodapé quando configurados. |

O formulário permanece indisponível para envio até existir um endpoint correto. O provedor deve validar os campos e o consentimento, filtrar spam, limitar requisições e aplicar a política de retenção definida pela KRINDAL. Credenciais pertencem ao provedor. Revise os textos identificados como provisórios de Privacidade e Termos com base no fluxo real de dados, incluindo o carregamento externo das fontes. A imagem do About mostra um ambiente de trabalho. Substitua ou complemente esse material com o retrato real da fundadora quando houver imagem aprovada.

## Publicação no GitHub Pages

1. Envie os arquivos para o repositório GitHub escolhido.
2. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**, escolha a branch e a pasta **/(root)** e salve.
3. Registre a URL exibida em `site.json`. Execute `node build.mjs` e publique os arquivos regenerados. O arquivo `.nojekyll` sinaliza que os arquivos já estão prontos para serem servidos.
4. Abra a URL final, verifique as páginas nos três idiomas e teste uma URL inexistente. Em sites publicados sob um caminho de repositório, a política de rastreamento do domínio é determinada pelo `robots.txt` na raiz do domínio. O sitemap do projeto continua disponível na sua URL própria.

[Documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

### Atualizações após a primeira publicação

Ao editar conteúdo, modelos ou a configuração de URL, execute `node build.mjs`. Revise as mudanças com `git status` e `git diff`, adicione os arquivos revisados, crie um commit e execute `git push origin main`. O GitHub Pages publica a partir de `main`, na raiz.

### Domínio próprio

Quando o domínio da KRINDAL estiver disponível, verifique-o na conta do GitHub, configure o domínio em **Settings → Pages** e faça os ajustes nos registros DNS do provedor autorizado. Atualize `site.json`, regenere as páginas e verifique HTTPS, redirecionamento e sitemap. Nessa etapa, inclua o `CNAME` gerado pelo GitHub no histórico do projeto.


## Checklist de validação

- [ ] Conferir Home, Sobre, Serviços, Nossa abordagem, Contato, FAQ, Privacidade, Termos e 404 nos três idiomas.
- [ ] Navegar com Tab, Shift+Tab, Enter e Escape. Conferir menu, link para pular ao conteúdo, foco e retorno ao topo.
- [ ] Conferir telas estreitas, tablet, desktop e ultrawide, zoom a 200% e preferência por movimento reduzido.
- [ ] Trocar de idioma nas páginas internas, reabrir a URL inicial e verificar a preferência salva e as URLs explícitas.
- [ ] Verificar validação do formulário, serviço pré-selecionado, timeout, erros, submissão duplicada e confirmação após aceitação real pelo provedor.
- [ ] Conferir os canais, o agendador, a política publicada e o consentimento com o fluxo real.
- [ ] Validar canonical, hreflang, compartilhamento social, sitemap e dados estruturados na URL final.
- [ ] Rodar Lighthouse e uma verificação de acessibilidade em dispositivos representativos.