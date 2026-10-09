import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { withFinalSanfreightLogo, withSolutionsNav } from "@/lib/solutionsNavMarkup";
import type { LogisticsServiceContent } from "@/lib/logisticsServiceContent";
import PageTransition from "@/components/PageTransition";

function matchingElementEnd(html: string, start: number, tagName: string): number {
  const tags = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tags.lastIndex = html.indexOf(">", start) + 1;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return tags.lastIndex;
  }
  return -1;
}

function extractElement(html: string, marker: string, tagName: string): string {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing shell element: ${marker}`);
  const start = html.lastIndexOf("<", markerIndex);
  const end = matchingElementEnd(html, start, tagName);
  if (end < 0) throw new Error(`Unclosed shell element: ${marker}`);
  return html.slice(start, end);
}

function replaceRequired(html: string, current: string, replacement: string): string {
  const index = html.indexOf(current);
  if (index < 0) throw new Error(`Expected page copy not found: ${current.slice(0, 80)}`);
  return html.slice(0, index) + replacement + html.slice(index + current.length);
}

function removeElementContaining(html: string, marker: string, tagName: string, startMarker: string): string {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Expected page element not found: ${marker}`);
  const start = html.lastIndexOf(startMarker, markerIndex);
  const end = matchingElementEnd(html, start, tagName);
  if (start < 0 || end < 0) throw new Error(`Could not isolate page element: ${marker}`);
  return html.slice(0, start) + html.slice(end);
}

function preparePage(service: LogisticsServiceContent) {
  const original = fs.readFileSync(path.join(process.cwd(), "Scarped website", "index.html"), "utf8");
  const homepage = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "src/content/pages/en/page.json"), "utf8"),
  ).bodyHtml as string;

  const bodyStart = original.indexOf("<body");
  const bodyContentStart = original.indexOf(">", bodyStart) + 1;
  const bodyEnd = original.lastIndexOf("</body>");
  if (bodyStart < 0 || bodyContentStart <= 0 || bodyEnd < 0) throw new Error("MIMCO body not found");
  let body = original.slice(bodyContentStart, bodyEnd);

  // The scraped MIMCO loader is normally dismissed by its original document
  // bootstrap. This route intentionally omits that bootstrap, so don't leave
  // its overlay covering the SanFreight header or the page content.
  body = body.replace(/<div\s+id="screen-loader"[^>]*>\s*<\/div>/i, "");

  // Keep the shared page-transition animation, but use the SanFreight loader
  // already shipped in the homepage markup instead of MIMCO's inline SVG logo.
  const mimcoInterloader = extractElement(body, '<div class="module-interloader"', "div");
  const sanfreightInterloader = extractElement(homepage, '<div class="module-interloader"', "div");
  body = body.replace(mimcoInterloader, sanfreightInterloader);

  // The scraped page includes MIMCO's contact popup, but the SanFreight CTA
  // handler expects SanFreight's ContactPopin component and field structure.
  // Keep the existing route bundle and replace only the popup markup.
  const mimcoContactPopin = extractElement(
    body,
    'class="module-contact-popin" data-component="ContactPopin"',
    "div",
  );
  const sanfreightContactPopin = extractElement(
    homepage,
    'class="module-full module-contact-popin" data-component="ContactPopin"',
    "div",
  );
  body = replaceRequired(body, mimcoContactPopin, sanfreightContactPopin);

  // Both bundles use the same component name for different canvas renderers.
  // This route's local MIMCO bundle registers the route-specific alias below,
  // so the SanFreight bundle cannot mount its diagonal-line renderer here.
  body = replaceRequired(
    body,
    'data-component="HomepageInteractiveImage"',
    'data-component="MimcoHomepageInteractiveImage"',
  );

  // Replace the source copy while preserving its section wrappers and animations.
  const copyReplacements: Array<[string, string]> = [
    ["MIMCO Platform : votre accès à <span>l’immobilier institutionnel</span>", service.heroTitle],
    ["Accédez et investissez simplement dans les projets du groupe MIMCO.", service.heroLead],
    ["Une plateforme digitale pensée pour vos <span>investissements immobiliers</span>", service.detailHeading],
    ["MIMCO Platform vous propose des fonctionnalités conçues pour simplifier chaque étape de votre parcours d’investissement, directement en ligne.", service.detailLead],
    ["Accès à l’immobilier institutionnel :", service.capabilities[0].heading],
    ["des opportunités habituellement réservées aux acteurs professionnels.", service.capabilities[0].detail],
    ["Souscription et suivi en ligne :", service.capabilities[1].heading],
    ["souscrivez simplement et suivez vos investissements depuis la plateforme.", service.capabilities[1].detail],
    ["Documents centralisés :", service.capabilities[2].heading],
    ["reportings, attestations et justificatifs disponibles en permanence.", service.capabilities[2].detail],
    ["Accédez à des opportunités de qualité institutionnelle", service.optionsHeading],
    ["Avec MIMCO Platform, vous investissez dans des actifs immobiliers premium, habituellement réservés aux investisseurs institutionnels.", service.optionsLead],
    ["Un parcours d’investissement 100 % digital et simplifié", service.options[0].heading],
    ["L’expérience proposée par MIMCO Platform repose sur un parcours simple et entièrement digital. L’inscription se fait en ligne, l’accès aux opportunités est immédiat et le suivi des investissements s’effectue via votre espace personnel.", service.options[0].detail],
    ["Une vision claire de vos investissements", service.options[1].heading],
    ["Votre espace centralise l’ensemble de vos informations. Vous y retrouvez en temps réel le détail de vos investissements, vos documents et l’historique de vos opérations pour une vision claire et actualisée à tout moment.", service.options[1].detail],
    ["Un accompagnement à chaque étape", service.options[2].heading],
    ["Avec MIMCO Platform, vous êtes accompagné à chaque étape. Votre conseiller en gestion de patrimoine dispose d’un espace dédié lui permettant de vous suivre dès l’inscription, tout au long de votre parcours de souscription et jusqu’au suivi de vos investissements.", service.options[2].detail],
    ["Une nouvelle façon d’accéder à <span>l’investissement immobilier</span>", service.supportingHeading],
    ["Toujours plus intuitive", service.supportingServices[0].title],
    ["La plateforme évolue pour offrir une expérience de navigation fluide et accessible. Que vous soyez investisseur débutant ou expérimenté, vous pourrez consulter vos informations clés, suivre vos projets et explorer les opportunités depuis une interface claire, adaptée à tous vos appareils.", service.supportingServices[0].description],
    ["Toujours plus transparente", service.supportingServices[1].title],
    ["Sur MIMCO Platform, vous pourrez consulter une fiche détaillée pour chaque opportunité d’investissement. Objectifs financiers, calendrier prévisionnel, étapes clés, éléments de contexte et analyse des risques y seront présentés de manière structurée, pour faciliter votre compréhension et votre prise de décision.", service.supportingServices[1].description],
    ["Toujours plus de suivi", service.supportingServices[2].title],
    ["Vous accéderez à un dashboard dédié pour suivre vos investissements, consulter vos performances, et retrouver vos documents et reportings détaillés. Toutes vos informations clés seront réunies dans un espace clair et sécurisé.", service.supportingServices[2].description],
  ];
  for (const [current, replacement] of copyReplacements) {
    body = replaceRequired(body, current, replacement);
  }

  body = replaceRequired(body, "Au plus proche de <span>vos besoins</span>", service.showcaseHeading);
  body = replaceRequired(
    body,
    "En centralisant toutes les informations essentielles, MIMCO Platform facilite la prise de décision, le suivi des performances et les échanges avec votre conseiller en gestion de patrimoine (CGP).",
    service.showcaseLead,
  );
  const sourceShowcase: Array<[string, string]> = [
    ["Échangez avec votre interlocuteur dédié", "Connectez votre espace investisseur à votre CGP pour un accompagnement sur mesure. Suivez vos opérations conjointement, accédez à des conseils adaptés à votre profil et bénéficiez d’une vision partagée de vos investissements."],
    ["Vision clair de vos investissements", "Accédez à un tableau de bord lisible et actualisé, conçu pour faciliter le suivi de vos projets. Sur MIMCO Platform, vous pourrez visualiser l’état de vos souscriptions, consulter les documents associés et suivre les prochaines étapes de chaque investissement."],
    ["Business plan détaillé", "Pour chaque projet, découvrez une analyse financière complète : hypothèses de rentabilité, structure du financement, calendrier et indicateurs clés. La transparence avant tout, pour des décisions éclairées."],
    ["Déclaration simplifiée de l’origine des fonds", "Nous simplifions le processus de conformité. Remplissez vos informations en quelques clics grâce à un parcours digital intuitif et sécurisé, conforme aux exigences réglementaires européennes."],
    ["Des offres institutionnelles à portée de main", "Vous choisissez le montant que vous souhaitez engager, la nature de votre placement ainsi que votre stratégie de diversification, qu’elle soit sectorielle ou géographique."],
    ["Investissez en quelques en clics", "Souscrivez simplement et rapidement à des opportunités immobilières exclusives, directement depuis votre espace en ligne. Une expérience fluide, sécurisée et 100 % digitale, pensée pour simplifier chaque étape de votre investissement."],
    ["Des projets présentés en toute transparence", "Accédez à une information complète avant chaque décision : webinaires, documents clés, business plans et analyses détaillées. Tout est réuni pour vous permettre d’investir en toute connaissance de cause."],
  ];
  sourceShowcase.forEach(([title, description], index) => {
    body = body.replaceAll(title, service.showcase[index].title);
    body = body.replaceAll(description, service.showcase[index].description);
  });

  const showcaseStart = body.indexOf('<div class="module projects-slideshow"');
  const showcaseEnd = body.indexOf('<div class="module hero with-title"', showcaseStart);
  if (showcaseStart >= 0 && showcaseEnd > showcaseStart) {
    let showcase = body.slice(showcaseStart, showcaseEnd);
    let imageIndex = 0;
    showcase = showcase.replace(/(<img\b[^>]*\balt=")[^"]*(")/gi, (match, opening: string, closing: string) => {
      const item = service.showcase[imageIndex++];
      return item ? `${opening}${item.title.replaceAll("&", "&amp;")}${closing}` : match;
    });
    body = body.slice(0, showcaseStart) + showcase + body.slice(showcaseEnd);
  }

  // The new copy has three feature points, so keep the original synchronized
  // image/list animation at three items rather than leaving an unrelated fourth.
  body = removeElementContaining(body, "icon-accompagnement.svg", "div", '<div class="presentation"');
  body = removeElementContaining(body, "accompagnement-conseiller-icone-mimco-640x840-c.jpg", "picture", "<picture");

  const sanfreightFooterContainer = extractElement(homepage, '<div class="footer-container"', "div");
  const sanfreightShell = withSolutionsNav(
    extractElement(homepage, '<header id="header"', "header") + sanfreightFooterContainer,
  );
  const sanfreightHeader = extractElement(sanfreightShell, '<header id="header"', "header");
  const sanfreightCta = extractElement(sanfreightShell, '<div id="contact"', "div");
  const sanfreightFooter = extractElement(sanfreightShell, '<footer id="footer"', "footer");
  const footerContainerOpen = sanfreightFooterContainer.slice(0, sanfreightFooterContainer.indexOf(">") + 1);

  body = body.replace(extractElement(body, '<header id="header"', "header"), sanfreightHeader);

  // Keep MIMCO's content and animation scripts intact; make its signup CTAs lead to SanFreight contact.
  body = body
    .replace("Rejoignez la plateforme et accédez aux opportunités", "Tell us what you need to ship")
    .replace("Créez votre espace investisseur sur MIMCO Platform et accédez à une sélection d’actifs immobiliers institutionnels.", service.contactCopy)
    .replaceAll(
      'href="https://app.mimco-platform.com/inscription"',
      'href="#contact" data-sanfreight-contact-trigger',
    )
    .replace(/(<a\b[^>]*class="cta-custom"[^>]*>[\s\S]*?<p class="text"><span>)[^<]*(<\/span>)/g, "$1Get Quote$2")
    .replace(/((?:src|srcset|href|data-src|data-srcset)=["'])images\//gi, "$1/scraped-preview/images/");

  const finalCtaStart = body.lastIndexOf('<div class="module hero with-title"');
  if (finalCtaStart < 0) throw new Error("MIMCO final CTA section not found");
  const finalCtaEnd = matchingElementEnd(body, finalCtaStart, "div");
  if (finalCtaEnd < 0) throw new Error("MIMCO final CTA section is not closed");
  body = body.slice(0, finalCtaStart) + footerContainerOpen + sanfreightCta + "</div>" + body.slice(finalCtaEnd);

  const oldFooterStart = body.indexOf('<footer id="footer"');
  if (oldFooterStart < 0) throw new Error("MIMCO footer not found");
  const oldFooterEnd = matchingElementEnd(body, oldFooterStart, "footer");
  if (oldFooterEnd < 0) throw new Error("MIMCO footer is not closed");
  body = body.slice(0, oldFooterStart) + sanfreightFooter + body.slice(oldFooterEnd);

  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  body = withFinalSanfreightLogo(body);

  const teamBlock = original.match(/<!-- Team members -->([\s\S]*?)<!-- End Team members -->/i)?.[1] ?? "";
  const teamScript = teamBlock.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? "";
  const safeTeamScript = teamScript.replace(
    /data-ccp-props=\\"(\{[^}]*\})\\">/g,
    (_match, props: string) => `data-ccp-props=\\"${props.replace(/"/g, '\\"')}\\">`,
  );

  return { body, safeTeamScript };
}

export const dynamic = "force-dynamic";

export default function LogisticsServicePage({ service }: { service: LogisticsServiceContent }) {
  const { body, safeTeamScript } = preparePage(service);
  return (
    <>
      <link rel="stylesheet" href="/scraped-preview/css-branded/app-DBwBKX7p.css" precedence="default" />
      <PageTransition bodyClass="" revealImmediately />
      <style>{`
        #pagebuilder { overflow: visible; background-color: var(--black); }
        #logistics-platform-page :is(
          .module.hero .description,
          .module.hero .bottom .main-title,
          .module.projects .title,
          .module.projects-slideshow .header-wrapper .title,
          .module.invest .title,
          .module.invest .secondary-container .title-secondary,
          .module.graph .content-container .title,
          .module.texts .text-wrapper h2,
          .module.faq h2,
          .module.invest-steps .wrapper .title,
          .module.services .content-container .content-wrapper .description,
          .module.cards h2,
          .module.cards .cards-container .card-wrapper .title,
          .module-text-and-description .title-wrapper .title,
          .module.presentation .title,
          .module.inline-key-numbers .content-container .title,
          .module.newsletter .content-container .content-wrapper .title,
          .module.rewards .content-container .content-wrapper .title,
          .module.team-slideshow .header-wrapper .title,
          .module.multiple-texts .title-wrapper .title,
          .module.multiple-texts .content-wrapper .secondary-title,
          .module.strategies .title-wrapper .title,
          .module.strategies .content-container .content-wrapper .secondary-title
        ) span {
          font-family: Aeonik !important;
          font-style: normal !important;
        }
        #logistics-platform-page .sf-hero-title-break { display: none; }
        @media (min-width: 1160px) {
          #logistics-platform-page .module.hero.centered .main-title { max-width: 1100px !important; }
          #logistics-platform-page .sf-hero-title-break { display: block; }
        }
        #pagebuilder .canvas-interactive-image { filter: hue-rotate(-90deg) saturate(1.1); }
        #pagebuilder img[src*="/icon-acces-immobilier-institutionnel.svg"],
        #pagebuilder img[src*="/icon-accompagnement.svg"],
        #pagebuilder img[src*="/icon-documents-centralises.svg"],
        #pagebuilder img[src*="/icon-subscription.svg"] { filter: hue-rotate(-90deg) saturate(1.1); }
        #logistics-platform-page #footer span { color: inherit !important; }
        #logistics-platform-page #footer .partial-localisations .localisation-card .address,
        #logistics-platform-page #footer .partial-localisations .localisation-card .address span,
        #logistics-platform-page #footer .partial-localisations .localisation-card .address a {
          color: #fff6 !important;
        }
        #logistics-platform-page #footer .scroll-top {
          background: #221d3e !important;
          color: var(--white) !important;
        }
        #logistics-platform-page #footer .scroll-top:before { background-color: #ffcc00 !important; }
        #logistics-platform-page #footer .scroll-top span { color: var(--white) !important; }
        #logistics-platform-page #footer .scroll-top:hover span { color: var(--black) !important; }
        html:has(#logistics-platform-page) .iubenda-tp-btn,
        html:has(#logistics-platform-page) .iubenda-cs-preferences-link,
        html:has(#logistics-platform-page) button[aria-label*="consentement"] {
          display: none !important;
        }
      `}</style>
      <div id="logistics-platform-page" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: body }} />
      <Script
        id="sanfreight-service-contact-cta"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(() => {
            const page = document.getElementById("logistics-platform-page");
            if (!page || page.dataset.serviceContactCtaBound) return;
            page.dataset.serviceContactCtaBound = "true";
            page.addEventListener("click", (event) => {
              const target = event.target;
              if (!(target instanceof Element)) return;
              const trigger = target.closest("[data-sanfreight-contact-trigger]");
              if (!trigger || !page.contains(trigger)) return;
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              page.querySelector("#contact .cta-custom")?.click();
            }, true);
          })();`,
        }}
      />
      {safeTeamScript && (
        <Script id="mimco-team-members" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: safeTeamScript }} />
      )}
      <Script src="/scraped-preview/js/email-decode.min.js" strategy="afterInteractive" />
      <Script src="/js/app-16e2282a.js" strategy="afterInteractive" />
      <Script src="/scraped-preview/js/app-yqyc1a_n.js" type="module" strategy="afterInteractive" />
    </>
  );
}
