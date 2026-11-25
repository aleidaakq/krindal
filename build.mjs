import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path,root),'utf8'));
const save = (path,data) => writeFile(new URL(path,root),data+'\n');
const config = await read('site.json');
const channels = await read('contact.json');
const whatsapp = new URL(channels.whatsappUrl);
if (whatsapp.origin !== 'https://wa.me' || whatsapp.pathname !== '/' + channels.phone.replace(/\D/g, '') || whatsapp.search || whatsapp.hash || whatsapp.username || whatsapp.password) {
  throw Error('Invalid public WhatsApp configuration.');
}
if (!/^[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+$/.test(channels.email)) throw Error('Invalid public email address.');
if (channels.formspreeId && !/^[a-z0-9]+$/i.test(channels.formspreeId)) throw Error('Invalid Formspree form ID.');
const endpoint = channels.formspreeId ? 'https://formspree.io/f/' + channels.formspreeId : '';
const site = config.siteUrl ? new URL(config.siteUrl.replace(/\/?$/, '/')) : null;
if (site && (site.protocol !== 'https:' || site.search || site.hash)) throw Error('Use an HTTPS site URL without query or fragment.');
const languages = {en:'','pt-BR':'pt-br/',es:'es/'};
const labels = {en:'EN','pt-BR':'PT-BR',es:'ES'};
const pages = ['index.html','about.html','services.html','contact.html','privacy.html','terms.html','404.html'];
const keys = ['executive','operations','projects','travel','talent','digital'];
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = (lang,file) => new URL(languages[lang]+(file==='index.html'?'':file),site).href;
const sitemap = [];
for (const [lang,dir] of Object.entries(languages)) {
  const c = await read('locales/'+lang+'.json');
  const copy = await read('locales/contact-'+lang+'.json');
  if (dir) await mkdir(new URL(dir,root),{recursive:true});
  const p = dir ? '../' : './';
  const [home,about,services,approach,contact] = c.nav.map(esc);
  const [skip,menu,top,privacy,terms,missing,returnHome,language,rights] = c.utility.map(esc);
  const [book,schedule,explore] = c.ctas.map(esc);
  const [, , , ,service,message,consent] = c.fields.map(esc);
  const [name,company,email,phone,country] = copy.fields.map(esc);
  const waHref = esc(whatsapp.href + '?text=' + encodeURIComponent(copy.prefill));
  const mailHref = esc('mailto:' + channels.email + '?subject=' + encodeURIComponent(copy.subject));
  const waLink = (label, css = '') => `<a ${css ? `class="${css}" ` : ''}href="${waHref}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const emailLink = `<a href="${mailHref}" aria-label="${esc(copy.emailDirect)}: ${esc(channels.email)}">${esc(channels.email)}</a>`;
  const channelsHtml = `<div class="contact-channels">${waLink(copy.start)}${emailLink}<div data-channels hidden></div></div>`;
  const contactCta = `<div class="contact-cta"><p>${esc(copy.direct)}</p>${waLink(copy.start,'btn-outline')}</div>`;
  const draft = esc(JSON.stringify({ url: whatsapp.href, heading: copy.heading, labels: copy.labels, source: copy.source }));
  const brand = '<span class="wordmark">KRINDAL<small>Executive Office</small></span>';
  const routes = ['index.html','about.html','services.html','index.html#approach','contact.html'];
  const nav = current => routes.map((href,i)=>`<a href="${href}"${current===href?' aria-current="page"':''}>${esc(c.nav[i])}</a>`).join('');
  const button = (href,text,kind='primary',booking=false)=>`<a href="${href}" class="btn-${kind}"${booking?' data-booking':''}>${text}</a>`;
  const discovery = text => button('contact.html#inquiry',text,'primary',true);
  const section = (id,title,body,style='')=>`<section class="section ${style}" id="${id}"><div class="container"><h2>${title}</h2>${body}</div></section>`;
  const head = title=>`<section class="page-heading dark"><div class="container"><h1>${title}</h1></div></section>`;
  const list = values => values.map(([title,body])=>`<li><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join('');
  const serviceList = detail => `<ol class="service-list">${c.services.map(([title,...scope],i)=>{
    const key = keys[i];
    const summary = detail
      ? `<h2>${esc(title)}</h2><ul class="scope">${scope.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`
      : `<h3><a href="services.html#${key}">${esc(title)}</a></h3>`;
    return `<li id="${key}"><span class="service-number" aria-hidden="true">0${i+1}</span><div>${summary}${i===5?`<p>${esc(c.digital)}</p>`:''}</div>${detail?button('contact.html?service='+key+'#inquiry',contact,'outline'):''}</li>`;
  }).join('')}</ol>`;
  const intl = section('international',esc(c.international),`<p>${esc(c.internationalText)}</p>`,'dark');
  const call = section('discovery',esc(c.contact),`<div class="contact-actions">${discovery(schedule)}${waLink(copy.talk,'btn-outline')}</div>`,'soft');
  const founder = `<section class="section"><div class="container about-grid"><img src="${p}assets/images/about.webp" alt="${esc(c.images[1])}" loading="lazy" width="1600" height="1067"><div><h2>${esc(c.founder)}</h2><p>${esc(c.bio)}</p></div></div></section>`;
  const field = (label,key,type,auto,max=120,hint='')=>`<label>${label}<input name="${key}" type="${type}" autocomplete="${auto}" maxlength="${max}"${hint} required></label>`;
  const statuses = [c.status[0],c.status[1],copy.thanks,copy.failed,copy.unavailable,copy.phoneError,copy.opening];
  const form = `<form id="inquiry" method="post" data-contact data-endpoint="${esc(endpoint)}" data-draft="${draft}" ${statuses.map((x,i)=>`data-status-${i}="${esc(x)}"`).join(' ')}>
<div class="fields">${field(name,'name','text','name')}${field(company,'company','text','organization')}${field(email,'email','email','email',254)}${field(phone,'phone','tel','tel',30,' aria-describedby="phone-format"')}${field(country,'country','text','country-name')}</div>
<p id="phone-format" class="form-note">${esc(copy.phoneError)}</p>
<label>${service}<select name="service" required><option value="">${esc(c.form[0])}</option>${c.services.map(([x],i)=>`<option value="${keys[i]}">${esc(x)}</option>`).join('')}<option value="other">${esc(c.form[1])}</option></select></label>
<label>${message}<textarea name="message" rows="6" minlength="10" maxlength="800" required></textarea></label>
<input type="hidden" name="language" value="${lang}">
<div hidden><input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></div>
<div class="consent"><label><input type="checkbox" name="consent" value="yes" required> ${consent}</label> <a href="privacy.html">${privacy}</a>.</div>
<p class="form-note">${esc(copy.notice)}</p>
<div class="contact-actions"><button class="btn-primary" type="submit" value="email" disabled>${esc(copy.emailAction)}</button><button class="btn-outline" type="submit" value="whatsapp" disabled>${esc(copy.whatsappAction)}</button></div>
<p class="form-note" data-email-unavailable${endpoint?' hidden':''}>${esc(copy.unavailable)}</p>
<div class="contact-feedback"><p class="form-status" role="status"></p><div data-success-contact hidden>${waLink(copy.start)}</div></div></form>`;
  const hero = `<section class="hero dark"><div class="container hero-grid"><div><p class="hero-label">${esc(c.eyebrow)}</p><h1>${esc(c.hero[0])}<br><span>${esc(c.hero[1])}</span></h1><p class="hero-intro">${esc(c.lead)}</p><div class="hero-actions">${discovery(schedule)}${button('services.html',explore,'outline')}${waLink(copy.talk,'btn-outline')}</div></div><img class="hero-image" src="${p}assets/images/hero.webp" alt="${esc(c.images[0])}" width="1600" height="900" fetchpriority="high"></div></section>`;
  const faq = section('faq',esc(c.faq),`<div class="faq">${c.questions.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`,'soft');
  const legal = (title,index)=>head(title)+`<div class="container section legal"><p><strong>${esc(c.legal[0])}</strong></p><p>${esc(c.legal[index])}</p></div>`;
  const content = [
    ['Executive Office',c.lead,hero+section('positioning',esc(c.position),`<p>${esc(c.positionText)}</p>`,'intro-section')+
      section('services',services,serviceList(false)+contactCta,'soft')+
      section('values',esc(c.dif),`<ul class="value-list">${list(c.values)}</ul>`)+
      section('approach',approach,`<ol class="step-list">${list(c.steps)}</ol>`,'soft')+founder+intl+call],
    [about,c.bio,head(about)+founder+intl+call],
    [services,c.services.map(x=>x[0]).join(', '),head(services)+`<div class="container section">${serviceList(true)}${contactCta}</div>`+call],
    [contact,c.intro,head(esc(c.contact))+`<section class="section"><div class="container contact-grid"><div><h2>${contact}</h2><p>${esc(c.intro)}</p><p>${esc(copy.direct)}</p>${channelsHtml}</div>${form}</div></section>`+faq],
    [privacy,copy.policy[0],head(privacy)+`<div class="container section legal">${copy.policy.map(x=>`<p>${esc(x)}</p>`).join('')}<p>${emailLink}</p></div>`],[terms,c.legal[2],legal(terms,2)],
    [missing,c.utility[5],head(missing)+`<div class="container section">${button('index.html',returnHome)}</div>`]
  ];
  const footer = `<footer class="dark"><div class="container footer-grid"><div><a href="index.html">${brand}</a><p>${esc(c.eyebrow)}</p>${channelsHtml}</div>
<nav aria-label="${home}">${nav(null)}</nav><nav aria-label="${services}">${c.services.map(([title],i)=>`<a href="services.html#${keys[i]}">${esc(title)}</a>`).join('')}</nav>
<div class="footer-meta"><a href="privacy.html">${privacy}</a><a href="terms.html">${terms}</a><a href="#top">${top}</a><small>© <span data-year>${new Date().getUTCFullYear()}</span> KRINDAL. ${rights}</small></div></div></footer>`;
  for (const [i,[title,description,body]] of content.entries()) {
    const file = pages[i];
    const is404 = file === '404.html';
    const canonical = site && !is404 ? url(lang,file) : '';
    if (canonical) sitemap.push(canonical);
    const image = site ? new URL('assets/images/hero.webp',site).href : '';
    const alternates = !site ? [] : Object.keys(languages).map(code=>`<link rel="alternate" hreflang="${code}" href="${esc(url(code,file))}">`);
    const seo = canonical ? `<link rel="canonical" href="${esc(canonical)}">
${alternates.join('\n')}
<link rel="alternate" hreflang="x-default" href="${esc(url('en',file))}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:image" content="${esc(image)}">` : '';
    const schema = i === 0 ? `<script type="application/ld+json">${JSON.stringify({
      '@context':'https://schema.org','@type':'Organization',name:channels.company,description:c.lead,
      areaServed:'Worldwide',...(site?{url:site.href}:{})
    }).replace(/</g,'\\u003c')}</script>` : '';
    const localeLinks = Object.entries(languages).map(([code,path])=>`<a data-lang="${code}" lang="${code}" hreflang="${code}" href="${p}${path}${file}"${code===lang?' aria-current="true"':''}>${labels[code]}</a>`).join('');
    await save(dir+file,`<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${is404 && site ? `<base href="${esc(url(lang,file))}">` : ''}
<title>KRINDAL | ${title}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="KRINDAL | ${title}">
<meta property="og:description" content="${esc(description)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="KRINDAL | ${title}">
<meta name="twitter:description" content="${esc(description)}">
${is404?'<meta name="robots" content="noindex">':''}
${seo}
${schema}
<link rel="icon" href="${p}assets/logos/mark.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="${p}css/main.css">
<script type="module" src="${p}js/main.js"></script>
</head>
<body id="top">
<a class="skip" href="#content">${skip}</a>
<header class="header" id="header"><div class="container navbar">
<a href="index.html">${brand}</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" hidden>${menu}</button>
<div id="site-nav" class="nav-panel"><nav class="nav-list" aria-label="${home}">${nav(file)}</nav>
<nav class="languages" aria-label="${language}">${localeLinks}</nav>${discovery(book)}</div></div></header>
<main id="content" tabindex="-1">${body}</main>
${footer}
<a class="whatsapp-float" href="${waHref}" target="_blank" rel="noopener noreferrer" aria-labelledby="whatsapp-label">
<img src="${p}assets/logos/whatsapp.svg" width="26" height="26" alt="">
<span id="whatsapp-label">${esc(copy.start)}</span></a>
</body></html>`);
  }
}
await save('robots.txt','User-agent: *\nAllow: /'+(site?'\nSitemap: '+new URL('sitemap.xml',site).href:''));
await save('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
  sitemap.map(x=>'\n  <url><loc>'+esc(x)+'</loc></url>').join('')+'\n</urlset>');
console.log('Generated 21 HTML pages.');