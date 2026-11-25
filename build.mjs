import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path,root),'utf8'));
const save = (path,data) => writeFile(new URL(path,root),data+'\n');
const config = await read('site.json');
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
  if (dir) await mkdir(new URL(dir,root),{recursive:true});
  const p = dir ? '../' : './';
  const [home,about,services,approach,contact] = c.nav.map(esc);
  const [skip,menu,top,privacy,terms,missing,returnHome,language,rights] = c.utility.map(esc);
  const [book,schedule,explore] = c.ctas.map(esc);
  const [name,company,email,phone,service,message,consent] = c.fields.map(esc);
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
  const call = section('discovery',esc(c.contact),discovery(schedule),'soft');
  const founder = `<section class="section"><div class="container about-grid"><img src="${p}assets/images/about.webp" alt="${esc(c.images[1])}" loading="lazy" width="1600" height="1067"><div><h2>${esc(c.founder)}</h2><p>${esc(c.bio)}</p></div></div></section>`;
  const field = (label,key,type,auto,required=true)=>`<label>${label}<input name="${key}" type="${type}" autocomplete="${auto}" maxlength="254"${required?' required':''}></label>`;
  const form = `<form id="inquiry" method="post" data-contact ${c.status.map((x,i)=>`data-status-${i}="${esc(x)}"`).join(' ')}>
<div class="fields">${field(name,'name','text','name')}${field(company,'company','text','organization')}${field(email,'email','email','email')}${field(phone,'phone','tel','tel',false)}</div>
<label>${service}<select name="service" required><option value="">${esc(c.form[0])}</option>${c.services.map(([x],i)=>`<option value="${keys[i]}">${esc(x)}</option>`).join('')}<option value="other">${esc(c.form[1])}</option></select></label>
<label>${message}<textarea name="message" rows="6" minlength="10" maxlength="3000" required></textarea></label>
<input type="hidden" name="language" value="${lang}">
<div class="consent"><label><input type="checkbox" name="consent" value="yes" required> ${consent}</label> <a href="privacy.html">${privacy}</a>.</div>
<button class="btn-primary" type="submit" disabled>${esc(c.form[2])}</button><p class="form-status" role="status">${esc(c.status[4])}</p></form>`;
  const hero = `<section class="hero dark"><div class="container hero-grid"><div><p class="hero-label">${esc(c.eyebrow)}</p><h1>${esc(c.hero[0])}<br><span>${esc(c.hero[1])}</span></h1><p class="hero-intro">${esc(c.lead)}</p><div class="hero-actions">${discovery(schedule)}${button('services.html',explore,'outline')}</div></div><img class="hero-image" src="${p}assets/images/hero.webp" alt="${esc(c.images[0])}" width="1600" height="900" fetchpriority="high"></div></section>`;
  const faq = section('faq',esc(c.faq),`<div class="faq">${c.questions.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`,'soft');
  const legal = (title,index)=>head(title)+`<div class="container section legal"><p><strong>${esc(c.legal[0])}</strong></p><p>${esc(c.legal[index])}</p></div>`;
  const content = [
    ['Executive Office',c.lead,hero+section('positioning',esc(c.position),`<p>${esc(c.positionText)}</p>`,'intro-section')+
      section('services',services,serviceList(false),'soft')+
      section('values',esc(c.dif),`<ul class="value-list">${list(c.values)}</ul>`)+
      section('approach',approach,`<ol class="step-list">${list(c.steps)}</ol>`,'soft')+founder+intl+call],
    [about,c.bio,head(about)+founder+intl+call],
    [services,c.services.map(x=>x[0]).join(', '),head(services)+`<div class="container section">${serviceList(true)}</div>`+call],
    [contact,c.intro,head(esc(c.contact))+`<section class="section"><div class="container contact-grid"><div><h2>${contact}</h2><p>${esc(c.intro)}</p><div data-channels hidden></div></div>${form}</div></section>`+faq],
    [privacy,c.legal[1],legal(privacy,1)],[terms,c.legal[2],legal(terms,2)],
    [missing,c.utility[5],head(missing)+`<div class="container section">${button('index.html',returnHome)}</div>`]
  ];
  const footer = `<footer class="dark"><div class="container footer-grid"><div><a href="index.html">${brand}</a><p>${esc(c.eyebrow)}</p><div data-channels hidden></div></div>
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
      '@context':'https://schema.org','@type':'Organization',name:'KRINDAL',description:c.lead,
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
</body></html>`);
  }
}
await save('robots.txt','User-agent: *\nAllow: /'+(site?'\nSitemap: '+new URL('sitemap.xml',site).href:''));
await save('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
  sitemap.map(x=>'\n  <url><loc>'+esc(x)+'</loc></url>').join('')+'\n</urlset>');
console.log('Generated 21 HTML pages.');