import { cn } from "@/lib/utils";

/** Renderizador markdown mínimo y seguro (sin HTML crudo) para contenido editorial. */
export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = content.trim().split(/\n{2,}/);
  return (
    <div className={cn("prose-club", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (/^###\s/.test(block)) return <h3 key={i}>{inline(block.replace(/^###\s/, ""))}</h3>;
        if (/^##\s/.test(block)) return <h2 key={i}>{inline(block.replace(/^##\s/, ""))}</h2>;
        if (/^>\s/.test(block)) return <blockquote key={i}>{inline(block.replace(/^>\s?/gm, ""))}</blockquote>;
        if (lines.every((l) => /^[-*]\s/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^[-*]\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\.\s/, ""))}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}

function inline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      out.push(
        <a key={k++} href={mm[2]} rel="noopener noreferrer">
          {mm[1]}
        </a>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
