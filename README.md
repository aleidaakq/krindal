# KRINDAL Executive Office

A KRINDAL é uma boutique independente de suporte executivo, estratégico e operacional para fundadores, CEOs e líderes. Seu site institucional está disponível em [inglês, português do Brasil e espanhol](https://aleidaakq.github.io/krindal/).

## Tecnologia e estrutura

- HTML estático, CSS modular com Grid e Flexbox, e JavaScript vanilla em módulos.
- Páginas em inglês na raiz e traduções em `pt-br/` e `es/`. Os HTMLs gerados são versionados e servidos diretamente pelo GitHub Pages.
- Conteúdo em `locales/`, estilos em `css/`, comportamento em `js/` e recursos visuais em `assets/`.
- `build.mjs` gera as páginas e o sitemap com Node.js 20 ou posterior. `site.json` define a URL pública usada nos metadados.

## Executar e atualizar no VS Code

1. Abra esta pasta no VS Code e inicie um terminal na raiz.
2. Use `python -m http.server 8000 --bind 127.0.0.1` e abra `http://127.0.0.1:8000/`.
3. Edite conteúdo em `locales/`, modelos em `build.mjs` e integrações conforme a tabela abaixo.
4. Execute `node build.mjs` após editar conteúdo, modelos, `site.json` ou `contact.json`. Revise o diff e versione os HTMLs gerados junto com as fontes.

## Configuração dos canais

| Arquivo | Campo | Uso |
| --- | --- | --- |
| `contact.json` | `company`, `phone`, `whatsappUrl`, `email` | Dados públicos de contato. Execute o gerador após alterar esses campos. |
| `contact.json` | `formspreeId` | ID público do formulário no Formspree. Enquanto estiver vazio, o botão de envio por formulário permanece desativado. |
| `js/config.js` | `bookingUrl`, `linkedInUrl` | Destinos públicos opcionais. |
| `locales/contact-*.json` | Textos e mensagens de contato | Rótulos, assuntos de e-mail, rascunhos e política nos três idiomas. |

O WhatsApp abre um rascunho pelo endereço oficial e o visitante confirma a entrega no aplicativo. O link de e-mail abre o cliente de e-mail com o assunto localizado. O formulário valida campos e telefone internacional, usa um campo antispam e bloqueia submissões simultâneas.

### Ativar o envio pelo Formspree

1. Crie uma conta no [Formspree](https://formspree.io/register) e confirme o endereço `aleidaakq@gmail.com`.
2. Selecione **+ → New Form** e escolha o endereço verificado como destinatário. Se necessário, configure **Workflow → Actions → Email** para esse endereço. Mantenha a proteção contra spam do provedor e configure a validação dos campos no painel.
3. Em **Integration**, copie somente o ID após `/f/` no endpoint exibido. Informe esse ID para ativar a integração ou preencha `formspreeId` em `contact.json`, execute `node build.mjs` e publique. O ID é público. Mantenha senhas e credenciais fora do repositório.
4. Envie uma solicitação de teste com dados fictícios. Confirme a aceitação no site, a entrada no painel e o recebimento em `aleidaakq@gmail.com`.
5. Confirme as regras de acesso e retenção no provedor e revise a Política de Privacidade conforme a configuração adotada.

O [plano gratuito do Formspree](https://help.formspree.io/articles/account-management/account-limits/) inclui 50 envios mensais. Para uma notificação automática em ambos os canais, uma alternativa é uma função backend acionada por webhook autenticado, com validação, deduplicação, limites de requisições e segredos no servidor. Ela enviaria o e-mail e um aviso com referência mínima a um número interno autorizado, distinto do remetente da [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview). A Meta pode exigir autorização do destinatário, modelo aprovado e tarifa por mensagem conforme o cenário. Essa automação depende de aprovação e configuração próprias.

Os Termos de Uso continuam provisórios. A seção da fundadora pode receber um retrato profissional quando houver material aprovado.

## GitHub Pages e domínio próprio

O repositório [aleidaakq/krindal](https://github.com/aleidaakq/krindal) publica automaticamente da raiz da branch `main`. O arquivo `.nojekyll` permite servir o site estático diretamente. Depois de revisar e registrar as alterações em um commit, execute `git push origin main` e acompanhe o deployment em **Actions**. [Configuração oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Para um futuro domínio próprio, verifique o domínio na conta do GitHub, configure-o em **Settings → Pages** e ajuste os registros DNS no provedor autorizado. Atualize `site.json`, regenere as páginas e confira HTTPS, a 404 e o sitemap. Inclua no histórico o `CNAME` criado pelo GitHub para o domínio autorizado.

## Checklist de validação

- [ ] Conferir navegação, teclado, menu e botão flutuante nos três idiomas e em diferentes larguras.
- [ ] Decodificar as mensagens iniciais, assuntos de e-mail e rascunhos do formulário e conferir o destinatário.
- [ ] Verificar validação, pré-seleção de serviço, falhas, envios simultâneos e sucesso após confirmação do endpoint.
- [ ] Testar a entrega real em ambiente publicado após configurar o Formspree.
- [ ] Conferir o deployment da branch, os metadados, o sitemap e a página 404.