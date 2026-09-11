"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight, Bookmark, Check, ChevronRight, Clock3, Heart,
  ImagePlus, Link2, LoaderCircle, Search, SlidersHorizontal, Sparkles, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";

type SearchLevel = { id: string; eyebrow: string; title: string; query: string; tone: string; reason: string };
type HistoryItem = { id: string; query: string; date: string; image: string };

const chips = ["Blazer", "Camel beige", "Oversized", "Wool blend", "Minimalist", "Single-breasted"];
const filters = {
  gender: ["Women", "Men", "Unisex"], size: ["All sizes", "XS", "S", "M", "L", "XL"],
  condition: ["Any condition", "New with tags", "Very good", "Good"], market: ["France", "Belgium", "Netherlands", "Spain"],
};
const initialSearches: SearchLevel[] = [
  { id: "closest", eyebrow: "01 · Closest match", title: "Same silhouette & fabric", query: "blazer beige oversized laine femme", tone: "#007782", reason: "Keeps all six visual attributes" },
  { id: "similar", eyebrow: "02 · Similar style", title: "More room to discover", query: "blazer camel oversize minimaliste", tone: "#7056d8", reason: "Flexible on fabric and brand" },
  { id: "budget", eyebrow: "03 · Lower price", title: "Same look, smarter price", query: "veste blazer beige ample", tone: "#c96c2d", reason: "Broader vocabulary, accessible brands" },
  { id: "premium", eyebrow: "04 · Premium", title: "Elevated alternatives", query: "blazer laine camel COS Arket Toteme", tone: "#1d1d1f", reason: "Premium brands with a close aesthetic" },
];
const demoHistory: HistoryItem[] = [
  { id: "h1", query: "Blazer beige oversized", date: "Today", image: "/demo-look.png" },
  { id: "h2", query: "Leather loafers burgundy", date: "Yesterday", image: "/demo-look.png" },
  { id: "h3", query: "Raw denim straight fit", date: "4 days ago", image: "/demo-look.png" },
];

function buildVintedUrl(query: string, market: string, min: string, max: string) {
  const origins: Record<string, string> = { France: "https://www.vinted.fr", Belgium: "https://www.vinted.be", Netherlands: "https://www.vinted.nl", Spain: "https://www.vinted.es" };
  const p = new URLSearchParams({ search_text: query });
  if (min) p.set("price_from", min);
  if (max) p.set("price_to", max);
  return `${origins[market] ?? origins.France}/catalog?${p.toString()}`;
}

export default function VintedLensApp({ displayName }: { displayName: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"search" | "history" | "favorites">("search");
  const [preview, setPreview] = useState("/demo-look.png");
  const [sourceUrl, setSourceUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [stage, setStage] = useState<"ready" | "analyzing" | "done">("ready");
  const [intent, setIntent] = useState<"exact" | "style">("exact");
  const [selectedChips, setSelectedChips] = useState(chips);
  const [editFilters, setEditFilters] = useState(true);
  const [gender, setGender] = useState("Women");
  const [size, setSize] = useState("All sizes");
  const [condition, setCondition] = useState("Any condition");
  const [market, setMarket] = useState("France");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("120");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [history, setHistory] = useState(demoHistory);

  const searches = useMemo(() => initialSearches.map((s) => ({
    ...s,
    query: intent === "style" ? s.query.replace("laine ", "").replace("femme", "style chic") : s.query,
  })), [intent]);

  useEffect(() => {
    const context = typeof document !== "undefined" ? (document as Document & { modelContext?: { registerTool?: Function } }).modelContext : undefined;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(context.registerTool({
      name: "prepare_vinted_search",
      title: "Prepare a Vinted search",
      description: "Set the search intent and show generated Vinted queries in the visible interface.",
      inputSchema: { type: "object", properties: { intent: { type: "string", enum: ["exact", "style"] } }, required: ["intent"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: { intent: "exact" | "style" }) { if (!["exact", "style"].includes(input.intent)) throw new Error("Invalid intent"); setIntent(input.intent); setStage("done"); return { status: "ready", intent: input.intent, queries: initialSearches.map(s => s.query) }; },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function onFile(file?: File) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStage("ready");
    const form = new FormData(); form.append("image", file);
    void fetch("/api/uploads", { method: "POST", body: form }).catch(() => undefined);
  }

  function analyze() {
    setStage("analyzing");
    window.setTimeout(() => {
      setStage("done");
      const next = { id: crypto.randomUUID(), query: "Blazer beige oversized", date: "Just now", image: preview };
      setHistory((items) => [next, ...items.filter(i => i.id !== "h1")]);
      void fetch("/api/searches", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: searches[0].query, sourceUrl, intent }) }).catch(() => undefined);
    }, 1300);
  }

  function applyUrl() {
    if (!sourceUrl.trim()) return;
    setPreview(sourceUrl.trim());
    setShowUrl(false);
    setStage("ready");
  }

  function toggleFavorite(id: string) {
    setFavorites((items) => items.includes(id) ? items.filter(x => x !== id) : [...items, id]);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#1f2624]">
      <header className="sticky top-0 z-40 border-b border-black/7 bg-[#f7f7f4]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
          <button onClick={() => setView("search")} className="flex items-center gap-2.5" aria-label="Vinted Lens home">
            <span className="grid size-9 place-items-center rounded-full bg-[#007782] text-white"><Search className="size-[18px]" strokeWidth={2.4}/></span>
            <span className="text-[1.08rem] font-semibold tracking-[-.04em]">Vinted Lens</span>
            <span className="hidden rounded-full bg-[#dff2ec] px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#006c70] sm:inline">MVP</span>
          </button>
          <nav className="hidden items-center gap-1 rounded-full border border-black/8 bg-white p-1 md:flex" aria-label="Main navigation">
            {[(["search", "New search", Search]), (["history", "History", Clock3]), (["favorites", "Saved", Bookmark])].map(([id, label, Icon]) => (
              <button key={id as string} onClick={() => setView(id as typeof view)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${view === id ? "bg-[#1f2624] text-white" : "text-[#69716f] hover:bg-black/5"}`}><Icon className="size-4"/>{label as string}</button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#69716f] sm:block">Hi, {displayName}</span>
            <div className="grid size-9 place-items-center rounded-full bg-[#e7cbb2] text-sm font-bold text-[#583e2a]">{displayName.slice(0, 1).toUpperCase()}</div>
          </div>
        </div>
      </header>

      {view === "search" ? (
        <div className="mx-auto max-w-[1480px] px-5 py-8 lg:px-8 lg:py-12">
          <section className="mb-8 grid gap-5 xl:grid-cols-[1.02fr_.98fr]">
            <div className="flex min-h-[430px] flex-col justify-between rounded-[32px] bg-[#202725] p-7 text-white lg:p-10">
              <div>
                <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-white/55"><Sparkles className="size-4 text-[#62d5c8]"/> Visual fashion search</div>
                <h1 className="max-w-[650px] text-[clamp(2.65rem,5.2vw,5rem)] font-medium leading-[.96] tracking-[-.065em]">Find it on Vinted.</h1>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">Upload any fashion item and turn its visual details into sharper second-hand searches.</p>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Button onClick={() => fileRef.current?.click()} className="h-14 rounded-2xl bg-[#8ce5d7] text-base font-semibold text-[#123d39] hover:bg-[#a5eee3]"><Upload className="size-5"/> Upload an image</Button>
                <input ref={fileRef} onChange={(e) => onFile(e.target.files?.[0])} type="file" accept="image/*" className="sr-only"/>
                <Button onClick={() => setShowUrl(true)} variant="outline" className="h-14 rounded-2xl border-white/18 bg-white/8 text-base text-white hover:bg-white/14 hover:text-white"><Link2 className="size-5"/> Paste image URL</Button>
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-[32px] bg-[#ddd7cc]">
              {/* A plain img supports both uploaded object URLs and remote image URLs. */}
              <img src={preview} alt="Fashion item ready for analysis" className="absolute inset-0 h-full w-full object-cover object-center"/>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 via-black/10 to-transparent p-6 pt-24 text-white">
                <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-white/65">Selected image</p><p className="mt-1 font-medium">Camel wool blazer</p></div>
                <button onClick={() => fileRef.current?.click()} className="rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-[#1f2624] backdrop-blur">Replace</button>
              </div>
              <div className="absolute left-[57%] top-[27%] size-5 rounded-full border-2 border-white bg-[#19aa9e] shadow-[0_0_0_7px_rgba(255,255,255,.3)]" aria-hidden="true"/>
            </div>
          </section>

          {showUrl && <section className="mb-8 flex flex-col gap-3 rounded-[24px] border border-[#007782]/20 bg-[#e5f5f0] p-5 sm:flex-row"><input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/fashion-image.jpg" className="h-12 flex-1 rounded-xl border border-black/10 bg-white px-4 text-base outline-none focus:border-[#007782]"/><Button onClick={applyUrl} className="h-12 rounded-xl bg-[#007782] px-6">Use this image</Button><Button onClick={() => setShowUrl(false)} variant="ghost" size="icon" className="h-12 w-12 rounded-xl"><X/></Button></section>}

          <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
            <aside className="rounded-[28px] border border-black/7 bg-white p-6 lg:p-7">
              <div className="flex items-center justify-between"><div><p className="eyebrow">Search intent</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">How close should it be?</h2></div><SlidersHorizontal className="size-5 text-[#8b9290]"/></div>
              <div className="mt-5 grid grid-cols-2 rounded-2xl bg-[#f1f2ee] p-1.5">
                <button onClick={() => setIntent("exact")} className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${intent === "exact" ? "bg-white shadow-sm" : "text-[#747b79]"}`}>I want exactly this</button>
                <button onClick={() => setIntent("style")} className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${intent === "style" ? "bg-white shadow-sm" : "text-[#747b79]"}`}>I want this style</button>
              </div>
              <div className="mt-7 flex items-center justify-between"><div><p className="eyebrow">Detected details</p><p className="mt-1 text-sm text-[#747b79]">Tap to remove an attribute</p></div><span className="rounded-full bg-[#e5f5f0] px-3 py-1.5 text-xs font-bold text-[#007782]">94% match</span></div>
              <div className="mt-4 flex flex-wrap gap-2">{chips.map(chip => <button key={chip} onClick={() => setSelectedChips(c => c.includes(chip) ? c.filter(x => x !== chip) : [...c, chip])} className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${selectedChips.includes(chip) ? "border-[#a6d8d2] bg-[#eff9f6] text-[#176e68]" : "border-black/8 text-[#989e9c] line-through"}`}>{selectedChips.includes(chip) && <Check className="mr-1.5 inline size-3.5"/>}{chip}</button>)}</div>
              <div className="my-7 h-px bg-black/7"/>
              <div className="flex items-center justify-between"><div><p className="font-semibold">Edit filters</p><p className="text-sm text-[#858c8a]">Refine before searching</p></div><Switch checked={editFilters} onCheckedChange={setEditFilters}/></div>
              {editFilters && <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="filter-label">Category<NativeSelect value={gender} onChange={e => setGender(e.target.value)} className="mt-1.5 w-full rounded-xl bg-[#f7f7f4]">{filters.gender.map(v => <NativeSelectOption key={v}>{v}</NativeSelectOption>)}</NativeSelect></label>
                <label className="filter-label">Size<NativeSelect value={size} onChange={e => setSize(e.target.value)} className="mt-1.5 w-full rounded-xl bg-[#f7f7f4]">{filters.size.map(v => <NativeSelectOption key={v}>{v}</NativeSelectOption>)}</NativeSelect></label>
                <label className="filter-label">Condition<NativeSelect value={condition} onChange={e => setCondition(e.target.value)} className="mt-1.5 w-full rounded-xl bg-[#f7f7f4]">{filters.condition.map(v => <NativeSelectOption key={v}>{v}</NativeSelectOption>)}</NativeSelect></label>
                <label className="filter-label">Market<NativeSelect value={market} onChange={e => setMarket(e.target.value)} className="mt-1.5 w-full rounded-xl bg-[#f7f7f4]">{filters.market.map(v => <NativeSelectOption key={v}>{v}</NativeSelectOption>)}</NativeSelect></label>
                <label className="filter-label">Min €<input value={minPrice} onChange={e => setMinPrice(e.target.value)} inputMode="numeric" placeholder="0" className="filter-input"/></label>
                <label className="filter-label">Max €<input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} inputMode="numeric" placeholder="120" className="filter-input"/></label>
              </div>}
              <Button onClick={analyze} disabled={stage === "analyzing"} className="mt-7 h-14 w-full rounded-2xl bg-[#007782] text-base hover:bg-[#006570]">{stage === "analyzing" ? <><LoaderCircle className="size-5 animate-spin"/> Reading the look…</> : <><Sparkles className="size-5"/> Analyse & generate searches</>}</Button>
              <p className="mt-3 text-center text-xs leading-relaxed text-[#8b9290]">Visual analysis is simulated in this test build. Vinted links are generated live and open on the selected market.</p>
            </aside>

            <div className="rounded-[28px] border border-black/7 bg-white p-6 lg:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Smart queries</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Four ways to find the look</h2></div>{compare.length > 0 && <div className="rounded-full bg-[#202725] px-4 py-2 text-sm font-semibold text-white">Compare {compare.length} selected</div>}</div>
              <div className={`mt-6 grid gap-3 transition ${stage === "analyzing" ? "pointer-events-none opacity-35 blur-[2px]" : ""}`}>
                {searches.map((item) => {
                  const saved = favorites.includes(item.id); const selected = compare.includes(item.id);
                  return <article key={item.id} className="group rounded-[22px] border border-black/8 p-5 transition hover:-translate-y-0.5 hover:border-black/18 hover:shadow-[0_14px_35px_rgba(31,38,36,.07)]">
                    <div className="flex items-start gap-4"><span className="mt-1 h-10 w-1 rounded-full" style={{ background: item.tone }}/><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: item.tone }}>{item.eyebrow}</p><h3 className="mt-1.5 text-lg font-semibold">{item.title}</h3><div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f6f6f2] px-3.5 py-3 font-mono text-sm text-[#414846]"><Search className="size-4 shrink-0 text-[#8e9693]"/><span className="truncate">{item.query}</span></div><p className="mt-2 text-sm text-[#828987]">{item.reason}</p></div>
                      <button onClick={() => toggleFavorite(item.id)} className={`grid size-10 shrink-0 place-items-center rounded-full border transition ${saved ? "border-[#f4b8b2] bg-[#fff0ee] text-[#d94c41]" : "border-black/8 text-[#7a817f] hover:bg-black/4"}`} aria-label={saved ? "Remove from favorites" : "Save search"}><Heart className={`size-4 ${saved ? "fill-current" : ""}`}/></button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 pl-5"><Button asChild className="h-11 flex-1 rounded-xl bg-[#202725] hover:bg-[#343b39]"><a href={buildVintedUrl(item.query, market, minPrice, maxPrice)} target="_blank" rel="noreferrer">Search on Vinted <ArrowUpRight className="size-4"/></a></Button><button onClick={() => setCompare(c => selected ? c.filter(x => x !== item.id) : [...c, item.id].slice(-3))} className={`h-11 rounded-xl border px-4 text-sm font-semibold transition ${selected ? "border-[#007782] bg-[#e9f7f3] text-[#007782]" : "border-black/10 hover:bg-black/4"}`}>{selected ? "Selected" : "Compare"}</button></div>
                  </article>;
                })}
              </div>
            </div>
          </section>
        </div>
      ) : <LibraryView view={view} items={view === "history" ? history : history.filter((_, index) => index < Math.max(favorites.length, 1))} onBack={() => setView("search")}/>} 

      <footer className="mx-auto flex max-w-[1480px] flex-col gap-3 px-5 py-10 text-sm text-[#7d8582] sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>Vinted Lens is an independent search assistant and is not affiliated with Vinted.</p><p>No scraping · Search links only · Built for circular fashion</p></footer>
    </main>
  );
}

function LibraryView({ view, items, onBack }: { view: "history" | "favorites"; items: HistoryItem[]; onBack: () => void }) {
  return <div className="mx-auto min-h-[calc(100vh-150px)] max-w-[1180px] px-5 py-12 lg:px-8"><button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#65706d]">← Back to search</button><div className="flex items-end justify-between"><div><p className="eyebrow">Your collection</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.055em]">{view === "history" ? "Recent searches" : "Saved looks"}</h1></div><span className="text-sm text-[#7c8582]">{items.length} items</span></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.id} className="overflow-hidden rounded-[24px] border border-black/7 bg-white"><div className="relative aspect-[4/3] overflow-hidden bg-[#ddd7cc]"><Image src={item.image} fill unoptimized className="object-cover" alt="Saved fashion search"/></div><div className="flex items-center justify-between p-5"><div><h2 className="font-semibold">{item.query}</h2><p className="mt-1 text-sm text-[#858c8a]">{item.date}</p></div><ChevronRight className="size-5 text-[#858c8a]"/></div></article>)}</div></div>;
}
