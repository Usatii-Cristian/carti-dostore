import Link from "next/link";

// Randare Markdown minimalistă, fără dependințe externe: articolele din admin
// folosesc doar titluri, paragrafe, liste, citate, bold/italic și linkuri.
// Textul e împărțit în blocuri și randat prin JSX (deci escapat automat) —
// nu folosim `dangerouslySetInnerHTML`, ca un articol să nu poată injecta HTML.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // **bold**, *italic*, [text](url) — într-o singură trecere.
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern).filter(Boolean);

  parts.forEach((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
      return;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      nodes.push(<em key={key}>{part.slice(1, -1)}</em>);
      return;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const internal = href.startsWith("/");
      nodes.push(
        internal ? (
          <Link key={key} href={href} className="font-medium text-terracotta hover:underline">
            {label}
          </Link>
        ) : (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-terracotta hover:underline"
          >
            {label}
          </a>
        )
      );
      return;
    }

    nodes.push(part);
  });

  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className="space-y-5 text-[17px] leading-relaxed text-ink-soft">
      {blocks.map((raw, index) => {
        const block = raw.trim();
        if (!block) return null;
        const key = `block-${index}`;

        if (block.startsWith("### ")) {
          return (
            <h3 key={key} className="pt-2 font-serif text-xl font-semibold text-ink">
              {renderInline(block.slice(4), key)}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={key} className="pt-4 font-serif text-2xl font-semibold text-ink">
              {renderInline(block.slice(3), key)}
            </h2>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={key}
              className="border-l-3 border-terracotta/60 bg-cream-soft/60 py-3 pl-5 pr-4 font-serif text-lg italic text-ink"
            >
              {renderInline(block.replace(/^> ?/gm, ""), key)}
            </blockquote>
          );
        }

        // Listă cu bulinе („- " sau „* " pe fiecare linie)
        if (/^[-*] /.test(block)) {
          const items = block.split("\n").filter((line) => /^[-*] /.test(line));
          return (
            <ul key={key} className="ml-1 space-y-2">
              {items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                  <span>{renderInline(item.slice(2), `${key}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Listă numerotată
        if (/^\d+\. /.test(block)) {
          const items = block.split("\n").filter((line) => /^\d+\. /.test(line));
          return (
            <ol key={key} className="ml-1 space-y-2">
              {items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="flex gap-3">
                  <span className="font-semibold text-terracotta">{itemIndex + 1}.</span>
                  <span>{renderInline(item.replace(/^\d+\. /, ""), `${key}-${itemIndex}`)}</span>
                </li>
              ))}
            </ol>
          );
        }

        return <p key={key}>{renderInline(block, key)}</p>;
      })}
    </div>
  );
}
