import assets from "./assets.ts";
import { getDenoData } from "./deno_api.ts";
import * as ddoc from "./deno_doc_json.ts";
import * as info from "./deno_info_json.ts";
import {
  assert,
  unreachable,
} from "./deps.ts";

export function escape(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(
    ">",
    "&gt;",
  );
}

function sortDocNode(a: ddoc.DocNode, b: ddoc.DocNode): number {
  return a.kind !== b.kind
    ? a.kind.localeCompare(b.kind)
    : a.name.localeCompare(b.name);
}

function unimplemented(what: string | undefined | null): string {
  return `<span class=unimplemented>UNIMPLEMENTED${
    what != null ? ": " + escape(what) : ""
  }</span>`;
}

interface DocRendererOptions {
  private?: boolean;
  static?: boolean;
}

export class DocRenderer {
  #options: DocRendererOptions;

  constructor(options: DocRendererOptions = {}) {
    this.#options = options;
  }

  async render(specifier?: string): Promise<string> {
    const { doc: doc_j, info: info_j } = await getDenoData(
      specifier,
      { private: this.#options.private },
    );
    return `<!DOCTYPE html>
      <html>
        <head>
          ${this.renderHead("Docuraptor Documentation")}
        </head>
        <body>
          ${
      this.renderHeader(
        "Documentation for " + (specifier ? escape(specifier) : "Deno"),
        { private_toggle: true },
      )
    }
          ${
      info_j
        ? `<div class=metadata>
              ${this.renderInfo(info_j)}
            </div>`
        : ""
    }
          <div class=hor-flex>
            <nav class=sidebar>
              ${this.renderSidebar(doc_j)}
            </nav>
            <main>
              ${this.renderDoc(doc_j)}
            </main>
          </div>
        </body>
      </html>`;
  }

  renderClassConstructorDef(doc: ddoc.ClassConstructorDef): string {
    let res = `<span class=keyword>${
      doc.accessibility ? escape(doc.accessibility) + " " : ""
    } constructor</span>(${this.renderParams(doc.params)})`;

    if (doc.jsDoc !== null) {
      res += `<hr>${this.renderJSDoc(doc.jsDoc)}`;
    }

    return res;
  }

  renderClassDef(doc: ddoc.DocNodeClass, namespace?: string[]): string {
    const cd = doc.classDef;

    let res = `<span class=keyword>${
      cd.isAbstract ? "abstract " : ""
    }class</span> ${this.renderIdentifier(doc.name, namespace)}${
      this.renderTypeParams(cd.typeParams)
    }`;

    if (cd.extends !== null) {
      res += ` <span class=keyword>extends</span> <span class=typeref>${
        escape(cd.extends)
      }</span>${
        cd.superTypeParams.length > 0
          ? `&lt;${
            cd.superTypeParams.map((t) => this.renderTsTypeDef(t)).join(", ")
          }&gt;`
          : ""
      }`;
    }

    if (cd.implements.length > 0) {
      res += ` <span class=keyword>implements</span> ${
        cd.implements.map((t) => this.renderTsTypeDef(t)).join(", ")
      }`;
    }

    if (cd.properties.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        cd.properties.filter((p) =>
          this.#options.private || p.accessibility !== "private"
        )
          .map((p) => `<li>${this.renderClassPropertyDef(p)}</li>`).join("")
      }
    </ol>`;
    }

    if (cd.constructors.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        cd.constructors.filter((m) =>
          this.#options.private || m.accessibility !== "private"
        )
          .map((p) => `<li>${this.renderClassConstructorDef(p)}</li>`).join("")
      }
    </ol>`;
    }

    if (cd.methods.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        cd.methods.filter((m) =>
          this.#options.private || m.accessibility !== "private"
        )
          .map((p) => `<li>${this.renderClassMethodDef(p)}</li>`).join("")
      }
    </ol>`;
    }

    if (cd.indexSignatures.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        cd.indexSignatures.map((p) =>
          `<li>${this.renderIndexSignatureDef(p)}</li>`
        )
          .join("")
      }
    </ol>`;
    }

    return res;
  }

  renderClassMethodDef(doc: ddoc.ClassMethodDef): string {
    let res = `<span class=keyword>${
      doc.accessibility ? escape(doc.accessibility) + " " : ""
    }${doc.isAbstract ? "abstract " : ""}${doc.isStatic ? "static " : ""}${
      doc.kind === "getter"
        ? "get "
        : doc.kind === "setter"
        ? "set "
        : doc.kind === "method"
        ? ""
        : unreachable()
    }</span> ${escape(doc.name)}${doc.optional ? "?" : ""}${
      this.renderTypeParams(doc.functionDef.typeParams)
    }(${this.renderParams(doc.functionDef.params)})`;

    if (doc.functionDef.returnType !== null) {
      res += `: ${this.renderTsTypeDef(doc.functionDef.returnType)}`;
    }

    if (doc.jsDoc !== null) {
      res += `<hr>${this.renderJSDoc(doc.jsDoc)}`;
    }

    return res;
  }

  renderClassPropertyDef(doc: ddoc.ClassPropertyDef): string {
    let res = `<span class=keyword>${
      doc.accessibility ? escape(doc.accessibility) + " " : ""
    }${doc.isAbstract ? "abstract " : ""}${doc.isStatic ? "static " : ""}${
      doc.readonly ? "readonly " : ""
    }</span> ${escape(doc.name)}${doc.optional ? "?" : ""}`;

    if (doc.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.tsType)}`;
    }

    if (doc.jsDoc !== null) {
      res += `<hr>${this.renderJSDoc(doc.jsDoc)}`;
    }

    return res;
  }

  renderDoc(doc: ddoc.DocNode[], namespace?: string[]): string {
    let final = "<ol class=nomarks>";
    for (const node of doc.sort(sortDocNode)) {
      final += `<li class=${node.kind === "namespace" ? "namespace" : "node"}>${
        this.renderDocNode(node, namespace)
      }</li>`;
    }
    final += "</ol>";
    return final;
  }

  renderDocNode(doc: ddoc.DocNode, namespace?: string[]): string {
    return `
    ${this.renderDocNodeKind(doc, namespace)}
    ${doc.jsDoc !== null ? `<hr>${this.renderJSDoc(doc.jsDoc)}` : ""}
  `;
  }

  renderDocNodeKind(doc: ddoc.DocNode, namespace?: string[]): string {
    switch (doc.kind) {
      case "class":
        return this.renderClassDef(doc, namespace);
      case "enum":
        return this.renderEnumDef(doc, namespace);
      case "function":
        return this.renderFunctionDef(doc, namespace);
      case "interface":
        return this.renderInterfaceDef(doc, namespace);
      case "namespace":
        return this.renderNamespaceDef(doc, namespace);
      case "typeAlias":
        return this.renderTypeAliasDef(doc, namespace);
      case "variable":
        return this.renderVariableDef(doc, namespace);
      default:
        return unimplemented((doc as { kind: string }).kind);
    }
  }

  renderEnumDef(doc: ddoc.DocNodeEnum, namespace?: string[]): string {
    return `<span class=keyword>enum</span> ${
      this.renderIdentifier(doc.name, namespace)
    }
    <ol class="nomarks noborder">${
      doc.enumDef.members.map((m) => `<li>${escape(m.name)}</li>`).join("")
    }</ol>`;
  }

  renderFunctionDef(
    doc: ddoc.DocNodeFunction,
    namespace?: string[],
  ): string {
    let res = `<span class=keyword>${
      doc.functionDef.isAsync ? "async " : ""
    }function${doc.functionDef.isGenerator ? "*" : ""}</span> ${
      this.renderIdentifier(doc.name, namespace)
    }${this.renderTypeParams(doc.functionDef.typeParams)}(${
      this.renderParams(doc.functionDef.params)
    })`;

    if (doc.functionDef.returnType !== null) {
      res += `: ${this.renderTsTypeDef(doc.functionDef.returnType)}`;
    }

    return res;
  }

  renderHead(title: string): string {
    return `
      <meta charset="utf-8">
      <meta name=viewport content="width=device-width">
      <title>${title}</title>
    ` + (
      this.#options.static
        ? `
        <style>${assets.css.content}</style>
        <script>${assets.script.content}</script>
      `
        : `
        <link rel=icon href="/static/logo">
        <link rel=stylesheet href="/static/css">
        <script type=module src="/static/script"></script>
      `
    );
  }

  renderHeader(
    title: string,
    { private_toggle = false }: { private_toggle?: boolean } = {},
  ): string {
    return `<header>
      ${
      this.#options.static
        ? ""
        : `<a href="/"><img class=logo src="/static/logo" alt="Logo"></a>`
    }
      <h3 class="fill inline">${title}</h3>
      ${
      this.#options.static ? "" : `
          <div class=nowrap>
            ${
        private_toggle
          ? this.#options.private
            ? '<a href="?">View Public</a>'
            : '<a href="?private=1">View Private</a>'
          : ""
      }
            <form action="/form/open">
              <label>Module URL: <input name=url type=url></label>
              <input type=submit value=Go>
            </form>
          </div>
        `
    }
    </header>`;
  }

  renderIdentifier(identifier: string, namespace?: string[]): string {
    const namespace_html = escape(namespace ? namespace.join(".") + "." : "");
    const ident_id = `ident_${namespace_html}${escape(identifier)}`;

    return namespace_html +
      `<span id="${ident_id}" class=identifier><a href="#${ident_id}">${
        escape(identifier)
      }</a></span>`;
  }

  renderIndexSignatureDef(
    doc: ddoc.LiteralIndexSignatureDef,
  ): string {
    let res = `${doc.readonly ? "readonly " : ""} [${
      this.renderParams(doc.params)
    }]`;

    if (doc.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.tsType)}`;
    }

    return res;
  }

  renderInfo(info: info.FileInfo): string {
    const unique_deps = new Set(info.deps[1].map((d) => d[0]));
    const direct_deps = new Set(unique_deps);

    function scan_deps(deps: info.FileDeps): void {
      unique_deps.add(deps[0]);

      for (const dep of deps[1]) {
        scan_deps(dep);
      }
    }
    scan_deps(info.deps);
    unique_deps.delete(info.deps[0]);

    const transitive = unique_deps.size - direct_deps.size;

    return `<details>
      <summary class=padding>
        Unique dependencies: ${direct_deps.size} direct; ${transitive} transitive.
      </summary>
      <ol class="nomarks indent monospace">
        ${
      Array.from(unique_deps.values()).sort().map((u) =>
        `<li class=link><span class="iconize icon-${
          direct_deps.has(u)
            ? "green"
            : "orange"
        }">${direct_deps.has(u) ? "D" : "T"}</span> ${
          this.#options.static
            ? escape(u)
            : `<a href="/doc/${encodeURIComponent(u)}">${escape(u)}</a>`
        }</li>`
      ).join("")
    }
      </ol>
    </details>`;
  }

  renderInterfaceCallSignatureDef(
    doc: ddoc.InterfaceCallSignatureDef,
  ): string {
    let res = `${this.renderTypeParams(doc.typeParams)}(${
      this.renderParams(doc.params)
    })`;

    if (doc.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.tsType)}`;
    }

    if (doc.jsDoc !== null) {
      res += `<hr>${this.renderJSDoc(doc.jsDoc)}`;
    }

    return res;
  }

  renderInterfaceDef(
    doc: ddoc.DocNodeInterface,
    namespace?: string[],
  ): string {
    const id = doc.interfaceDef;

    let res = `<span class=keyword>interface</span> ${
      this.renderIdentifier(doc.name, namespace)
    }${this.renderTypeParams(id.typeParams)}`;

    if (id.extends.length > 0) {
      res += ` <span class=keyword>extends</span> <span class=typeref>${
        id.extends.map((t) => this.renderTsTypeDef(t)).join(", ")
      }</span>`;
    }

    if (id.properties.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        id.properties
          .map((p) => `<li>${this.renderInterfacePropertyDef(p)}</li>`).join("")
      }
    </ol>`;
    }

    if (id.callSignatures.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        id.callSignatures
          .map((p) => `<li>${this.renderInterfaceCallSignatureDef(p)}</li>`)
          .join("")
      }
    </ol>`;
    }

    if (id.methods.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        id.methods
          .map((p) => `<li>${this.renderInterfaceMethodDef(p)}</li>`).join("")
      }
    </ol>`;
    }

    if (id.indexSignatures.length > 0) {
      res += `<hr><ol class=nomarks>
      ${
        id.indexSignatures.map((p) =>
          `<li>${this.renderIndexSignatureDef(p)}</li>`
        )
          .join("")
      }
    </ol>`;
    }

    return res;
  }

  renderInterfaceMethodDef(doc: ddoc.InterfaceMethodDef): string {
    let res = `${escape(doc.name)}${doc.optional ? "?" : ""}${
      this.renderTypeParams(doc.typeParams)
    }(${this.renderParams(doc.params)})`;

    if (doc.returnType !== null) {
      res += `: ${this.renderTsTypeDef(doc.returnType)}`;
    }

    if (doc.jsDoc !== null) {
      res += `<hr>${this.renderJSDoc(doc.jsDoc)}`;
    }

    return res;
  }

  renderInterfacePropertyDef(doc: ddoc.InterfacePropertyDef): string {
    let res = `${escape(doc.name)}${doc.optional ? "?" : ""}`;

    if (doc.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.tsType)}`;
    }

    if (doc.jsDoc !== null) {
      res += `<hr>${this.renderJSDoc(doc.jsDoc)}`;
    }

    return res;
  }

  renderJSDoc(doc: string): string {
    const summary_end = doc.indexOf("\n\n");
    const [summary, remainder] = summary_end !== -1
      ? [doc.slice(0, summary_end), doc.slice(summary_end)]
      : [doc, undefined];

    let res = `<pre>${escape(summary)}</pre>`;
    if (remainder !== undefined) {
      res = `<details><summary>${res}</summary><pre>${
        escape(remainder)
      }</pre></details>`;
    }
    return res;
  }

  renderLiteralCallSignatureDef(
    doc: ddoc.LiteralCallSignatureDef,
  ): string {
    let res = `${this.renderTypeParams(doc.typeParams)}(${
      this.renderParams(doc.params)
    })`;

    if (doc.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.tsType)}`;
    }

    return res;
  }

  renderLiteralMethodDef(doc: ddoc.LiteralMethodDef): string {
    let res = `${escape(doc.name)}${this.renderTypeParams(doc.typeParams)}(${
      this.renderParams(doc.params)
    })`;

    if (doc.returnType !== null) {
      res += `: ${this.renderTsTypeDef(doc.returnType)}`;
    }

    return res;
  }

  renderLiteralPropertyDef(prop: ddoc.LiteralPropertyDef): string {
    let res = `${escape(prop.name)}${prop.optional ? "?" : ""}`;

    if (prop.tsType !== null) {
      res += `: ${this.renderTsTypeDef(prop.tsType)}`;
    }

    return res;
  }

  renderNamespaceDef(
    doc: ddoc.DocNodeNamespace,
    namespace?: string[],
  ): string {
    return `<span class=keyword>namespace</span> ${
      this.renderIdentifier(doc.name, namespace)
    } ${
      this.renderDoc(doc.namespaceDef.elements, [...namespace ?? [], doc.name])
    }`;
  }

  renderParamDef(doc: ddoc.ParamDef): string {
    let res = this.renderParamDefKind(doc);

    if (doc.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.tsType)}`;
    }

    return res;
  }

  renderObjectPatPropDef(prop: ddoc.ObjectPatPropDef): string {
    switch (prop.kind) {
      case "assign":
        // TODO Does not display assigned value
        return escape(prop.key);
      case "keyValue":
        return `${escape(prop.key)}: ${this.renderParamDef(prop.value)}`;
      case "rest":
        return `...${this.renderParamDef(prop.arg)}`;
    }
  }

  renderParamDefKind(doc: ddoc.ParamDef): string {
    switch (doc.kind) {
      case "array":
        return `[${
          doc.elements.map((e) => e === null ? "" : this.renderParamDef(e))
            .join(", ")
        }]${doc.optional ? "?" : ""}`;
      case "assign":
        // TODO Does not display assigned value
        return this.renderParamDef(doc.left);
      case "identifier":
        return escape(doc.name) + (doc.optional ? "?" : "");
      case "object":
        return `{${
          doc.props.map((p) => this.renderObjectPatPropDef(p)).join(", ")
        }}${doc.optional ? "?" : ""}`;
      case "rest":
        return `...${this.renderParamDef(doc.arg)}`;
      default:
        return unimplemented((doc as { kind: string }).kind);
    }
  }

  renderParams(params: ddoc.ParamDef[]): string {
    return params.map((p) => this.renderParamDef(p)).join(", ");
  }

  renderSidebar(doc: ddoc.DocNode[]): string {
    function collectIdents(
      doc: ddoc.DocNode[],
      namespace?: string[],
    ): { kind: ddoc.DocNode["kind"]; ident: string }[] {
      return doc.flatMap((
        d,
      ) => [
        { kind: d.kind, ident: escape([...namespace ?? [], d.name].join(".")) },
        ...(d.kind === "namespace"
          ? collectIdents(d.namespaceDef.elements, [...namespace ?? [], d.name])
          : []),
      ]);
    }

    return `<ol class="nomarks noborder notextwrap">
      ${
      collectIdents(doc).sort(({ ident: a }, { ident: b }) =>
        a.localeCompare(b)
      ).map(({ kind, ident }) =>
        `<li><span class="iconize icon-${kind}">${
          kind[0].toLocaleUpperCase()
        }</span> <a href="#ident_${escape(ident)}">${escape(ident)}</a></li>`
      ).join("")
    }
    </ol>`;
  }

  renderTypeAliasDef(
    doc: ddoc.DocNodeTypeAlias,
    namespace?: string[],
  ): string {
    return `<span class=keyword>type</span> ${
      this.renderIdentifier(doc.name, namespace)
    }${this.renderTypeParams(doc.typeAliasDef.typeParams)} = ${
      this.renderTsTypeDef(doc.typeAliasDef.tsType)
    }`;
  }

  renderTsTypeDef(type_def: ddoc.TsTypeDef): string {
    switch (type_def.kind) {
      case "array":
        return this.renderTsTypeDef(type_def.array) + "[]";
      case "conditional": {
        const ct = type_def.conditionalType;
        return `${
          this.renderTsTypeDef(ct.checkType)
        } <span class=keyword>extends</span> ${
          this.renderTsTypeDef(ct.extendsType)
        } ? ${this.renderTsTypeDef(ct.trueType)} : ${
          this.renderTsTypeDef(ct.falseType)
        }`;
      }
      case "fnOrConstructor": {
        const fn = type_def.fnOrConstructor;
        return `${
          fn.constructor ? "<span class=keyword>constructor</span>" : ""
        }${this.renderTypeParams(fn.typeParams)}(${
          this.renderParams(fn.params)
        }) => ${this.renderTsTypeDef(fn.tsType)}`;
      }
      case "indexedAccess": {
        const ia = type_def.indexedAccess;
        return `${ia.readonly ? "<span class=keyword>readonly</span> " : ""}${
          this.renderTsTypeDef(ia.objType)
        }[${this.renderTsTypeDef(ia.indexType)}]`;
      }
      case "intersection":
        return type_def.intersection.map((t) => this.renderTsTypeDef(t)).join(
          " &amp; ",
        );
      case "keyword":
        return `<span class=exkeyword>${escape(type_def.keyword)}</span>`;
      case "literal": {
        const lit = type_def.literal;
        return `<span class=literal>${
          lit.kind === "boolean"
            ? String(lit.boolean)
            : lit.kind === "number"
            ? String(lit.number)
            : lit.kind === "string"
            ? `"${escape(lit.string)}"`
            : unreachable()
        }</span>`;
      }
      case "optional":
        return `${this.renderTsTypeDef(type_def.optional)}?`;
      case "parenthesized":
        return `(${this.renderTsTypeDef(type_def.parenthesized)})`;
      case "rest":
        return `...${this.renderTsTypeDef(type_def.rest)}`;
      case "this":
        assert(type_def.this);
        return `<span class=keyword>this</span>`;
      case "tuple":
        return `[${
          type_def.tuple.map((t) => this.renderTsTypeDef(t)).join(", ")
        }]`;
      case "typeLiteral":
        return this.renderTypeLiteral(type_def.typeLiteral);
      case "typeOperator":
        return `<span class=keyword>${
          escape(type_def.typeOperator.operator)
        }</span> ${this.renderTsTypeDef(type_def.typeOperator.tsType)}`;
      case "typeQuery":
        return `<span class=typeref>${escape(type_def.typeQuery)}</span>`;
      case "typeRef": {
        const tr = type_def.typeRef;
        return `<span class=typeref>${escape(tr.typeName)}</span>${
          tr.typeParams !== null
            ? `&lt;${
              tr.typeParams.map((t) => this.renderTsTypeDef(t)).join(
                ", ",
              )
            }&gt;`
            : ""
        }`;
      }
      case "union":
        return type_def.union.map((t) => this.renderTsTypeDef(t)).join(" | ");
      default:
        return unimplemented((type_def as { kind: string }).kind);
    }
  }

  renderTypeLiteral(lit: ddoc.TsTypeLiteralDef): string {
    return `{ ${
      [
        lit.properties.map((p) => this.renderLiteralPropertyDef(p)),
        lit.callSignatures.map((c) => this.renderLiteralCallSignatureDef(c)),
        lit.methods.map((m) => this.renderLiteralMethodDef(m)),
        lit.indexSignatures.map((i) => this.renderIndexSignatureDef(i)),
        "",
      ].flat().join("; ")
    }}`;
  }

  renderTypeParams(type_params: ddoc.TsTypeParamDef[]): string {
    return type_params.length !== 0
      ? `&lt;${
        type_params.map((t) => this.renderTypeParamDef(t)).join(", ")
      }&gt;`
      : "";
  }

  renderTypeParamDef(doc: ddoc.TsTypeParamDef): string {
    let res = `<span class=typeref>${escape(doc.name)}</span>`;

    if (doc.constraint !== undefined) {
      res += ` <span class=keyword>extends</span> ${
        this.renderTsTypeDef(doc.constraint)
      }`;
    }
    if (doc.default !== undefined) {
      res += ` = ${this.renderTsTypeDef(doc.default)}`;
    }

    return res;
  }

  renderVariableDef(
    doc: ddoc.DocNodeVariable,
    namespace?: string[],
  ): string {
    let res = `<span class=keyword>${escape(doc.variableDef.kind)}</span> ${
      this.renderIdentifier(doc.name, namespace)
    }`;

    if (doc.variableDef.tsType !== null) {
      res += `: ${this.renderTsTypeDef(doc.variableDef.tsType)}`;
    }

    return res;
  }
}
