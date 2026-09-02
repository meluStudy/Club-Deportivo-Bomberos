export function Marquee({ items }: { items: string[] }) {
  const list = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-brand-700 bg-brand-600 py-3 text-white" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-lg font-bold uppercase tracking-widest">
        {list.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="size-2 rounded-full bg-white/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
