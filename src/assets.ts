interface Asset {
  content: string;
  mimetype?: string;
}

const assets: { [name: string]: Asset } = {
  css: {
    content: `
      :root {
        color: #111;
      }

      body {
        margin: 0;
      }

      div.metadata {
        border: 0.1em solid gray;
        margin: 1em 0;
        padding: 1ch;
      }

      img.logo {
        width: 5ch;
      }

      header {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin: 0.5em;
      }

      header * {
        align-self: center;
        margin: 0 0.5ch;
      }

      hr {
        border: 0.05em dashed #bbb;
      }

      li {
        border: 0.1em solid #bbb;
        margin: 0.2em;
        padding: 0.5em 1ch;
      }

      li.namespace {
        background: #ddd;
      }

      li.node {
        background: #eee;
      }

      li.node li {
        font-size: 0.9em;
      }

      ol {
        margin: 0;
      }

      main {
        flex-grow: 1;

        font-family: monospace;
        font-size: 1.2rem;
      }

      nav.sidebar {
        background: #eee;
        border: 0.1em solid gray;

        box-sizing: border-box;
        flex-basis: 25%;
        flex-shrink: 0;
        height: 100vh;
        max-width: 30ch;
        overflow: auto;

        position: sticky;
        top: 0;

        z-index: 5;
      }

      ol.noborder li {
        border-style: none;
        padding: 0 1ch;
      }

      ol.nomarks {
        list-style-type: none;
        padding-left: 0;
      }

      ol.indent {
        padding: 0 2ch;
      }

      pre {
        white-space: pre-wrap;
        font-size: 0.9em;
      }

      span.exkeyword {
        color: #005959;
      }

      span.iconize {
        display: inline-block;
        height: 1em;
        margin: 0.2em;
        padding: 0.1em;
        width: 1em;

        font-family: monospace;
        font-weight: bold;
        line-height: 1em;
        text-align: center;
        vertical-align: middle;

        color: black;
        background: red;
      }

      span.icon-class {
        background: #a8e;
      }

      span.icon-enum {
        background: #6af;
      }

      span.icon-function {
        background: #fd6;
      }

      span.icon-green {
        background: lightgreen;
      }

      span.icon-import {
        background:white;
      }

      span.icon-interface {
        background: #d8d;
      }

      span.icon-namespace {
        background: silver;
      }

      span.icon-orange {
        background: orange;
      }

      span.icon-typeAlias {
        background: #7bf;
      }

      span.icon-variable {
        background: #aea;
      }

      span.identifier {
        color: black;
        font-weight: bold;
      }

      span.keyword {
        color: darkmagenta;
      }

      span.literal {
        color: green;
      }

      span.typeref {
        color: navy;
      }

      span.unimplemented {
        color: #f44;
        background: #224;
        border: 0.2em dashed red;
        font-size: 0.8em;
      }

      .fill {
        flex-grow: 1;
      }

      .hor-flex {
        display: flex;
        flex-direction: row;
      }

      .inline {
        display: inline-block;
      }

      .monospace {
        font-family: monospace;
      }

      .notextwrap {
        white-space: nowrap;
      }

      .nowrap {
        display: inline-flex;
        flex-wrap: nowrap;
      }

      .padding {
        padding: 0.2em 1em;
      }

      @media(prefers-color-scheme: dark) {
        :root {
          color: #eee;
          background: #111;
        }

        a:link {
          color: cornflowerblue;
        }

        a:visited {
          color: dodgerblue;
        }

        li.link {
          background: #222;
        }

        li.namespace {
          background: #333;
        }

        li.node {
          background: #222;
        }

        nav.sidebar {
          background: #222;
          font-family: sans;
        }

        span.exkeyword {
          color: #00c1c1;
        }

        span.identifier {
          color: white;
        }

        span.keyword {
          color: violet;
        }

        span.literal {
          color: lightgreen;
        }

        span.typeref {
          color: deepskyblue;
        }
      }

      span a:link {
        color: inherit;
        text-decoration: inherit;
      }

      span a:visited {
        color: inherit;
        text-decoration: inherit;
      }
    `,
    mimetype: "text/css",
  },
  logo: {
    content: `<?xml version="1.0" encoding="UTF-8"?>
<svg id="SVGRoot" width="1024" height="1024" version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xlink="http://www.w3.org/1999/xlink"><title>Docuraptor</title><metadata><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title>Docuraptor</dc:title><cc:license rdf:resource="http://creativecommons.org/licenses/by-nc-nd/4.0/"/><dc:date>19.07.2020</dc:date><dc:creator><cc:Agent><dc:title>Valentin Anger</dc:title></cc:Agent></dc:creator></cc:Work><cc:License rdf:about="http://creativecommons.org/licenses/by-nc-nd/4.0/"><cc:permits rdf:resource="http://creativecommons.org/ns#Reproduction"/><cc:permits rdf:resource="http://creativecommons.org/ns#Distribution"/><cc:requires rdf:resource="http://creativecommons.org/ns#Notice"/><cc:requires rdf:resource="http://creativecommons.org/ns#Attribution"/><cc:prohibits rdf:resource="http://creativecommons.org/ns#CommercialUse"/></cc:License></rdf:RDF></metadata><circle cx="512" cy="512" r="496.47" fill="#323232" stroke="#000" stroke-width="11.728"/><path d="m517.09 560.85c123.1 31.537 29.408 172.91 29.408 172.91s30.221 16.099 57.84 29.934c-65.989 14.627-89.766 7.6793-104.68-7.9718-2.5212-47.444 56.359-123.42-32.352-188.95" fill="#fff" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="12.201"/><path d="m664.62 552.31c40.854-13.852 75.582-66.951 90.496-125.19-1.8788-32.469 182.39 16.616 184.16-43.065 1.2364-41.483-52.065-29.284-131.53-84.786-164.18-138.69-128.45 69.655-172.66 86.359-107.77 40.718-127.57 8.6074-282.24 95.737-62.603 22.355-237.89 2.2081-318.39 39.877 63.419 45.044 230.16 32.91 303.6 30.614 47.404 27.731 95.331 37.602 113.25 92.55 17.597 41.31-26.125 87.313-25.005 137.07 8.0441 30.176 66.032 39.468 109.55 30.686l-61.864-46.225c-4.5563-3.4045 92.008-67.945 35.59-162.05 66.219-30.509 94.407-31.029 155.03-51.583z" fill="#fff" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="12.201"/><g><g transform="matrix(31.6 6.6005 -6.6005 31.6 -34.18 -192.41)"><g fill="#fff" stroke="#000" stroke-linecap="square" stroke-width=".11339"><path d="m25 17h2v3h-2v-3"/><path d="m25.185 17.174h2v3h-2v-3"/><path d="m25.363 17.332h2v3h-2v-3"/></g><text x="25.632729" y="17.887829" font-family="monospace" font-size=".33333px" letter-spacing="0px" word-spacing="0px" style="line-height:1.25" xml:space="preserve"><tspan x="25.632729" y="17.887829">namespace</tspan><tspan x="25.632729" y="18.311554">Deno</tspan></text></g></g><g><path d="m937.42 385.56c-55.293 1.3526-116.83 16.257-162.32-11.135" fill="none" stroke="#000" stroke-width="12.201"/><circle cx="764.81" cy="325.48" r="10.821"/><g stroke="#000"><rect transform="rotate(-14.511)" x="631.63" y="490.25" width="58.584" height="30.632" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.1914"/><path d="m794.56 316.58c16.131-10.401 30.741-8.8292 30.741-8.8292" fill="none" stroke-width="2.4402"/><path d="m605.79 500.33c-36.184 28.884-49.893 73.7-35.616 115.27 12.842 21.117 55.843 29.917 105.58 25.723 24.703-15.256 33.249-28.34 39.088-42.261l-31.555 12.542c-37.867-1.9886-64.999 0.95232-64.887-20.764 0.0646-18.412 10.4-31.748 10.436-31.8" fill="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="12.201"/></g><path id="path130" d="m160 380c40-80 380-300 460-260" display="none" opacity="0" stroke-width="2"/><text fill="#ffffff" font-family="monospace" font-size="96px" letter-spacing="0px" word-spacing="0px" style="line-height:1.25" xml:space="preserve"><textPath xlink:href="#path130"><tspan font-size="96px">Docuraptor</tspan></textPath></text></g></svg>`,
    mimetype: "image/svg+xml",
  },
  script: {
    content: ``,
    mimetype: "application/javascript",
  },
};
export default assets;
