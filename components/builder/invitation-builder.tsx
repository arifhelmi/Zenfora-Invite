"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, Clock3, Copy, Eye, EyeOff, ImagePlus,
  Laptop, LoaderCircle, Monitor, Plus, Redo2, Save, Smartphone, Sparkles, Tablet, Trash2, Undo2, WandSparkles, X,
} from "lucide-react";
import { BuilderPageCanvas, type BuilderRenderEvent } from "@/components/invitation/builder-renderer";
import { BLOCK_DEFINITIONS, BLOCK_REGISTRY, PAGE_TYPE_LABELS } from "@/features/builder/registry";
import type { AllowedPageConfig, BuilderBlock, BuilderDocument, BuilderPage, BuilderViewport, PagePatch, PageType } from "@/features/builder/types";
import { ASPECT_RATIOS, ASSET_PURPOSES, BLOCK_TYPES, HEIGHT_MODES, PAGE_TYPES } from "@/features/builder/types";

type SaveState = "idle" | "saving" | "saved" | "failed";
type InspectorTab = "content" | "design" | "background" | "layout" | "animation" | "responsive" | "ai";
type Version = { id: string; label: string; source: string; createdAt: string };
type GenerationResult = { id: string; pageAssetId?: string | null; url: string; width?: number | null; height?: number | null };

const tabs: Array<{ id: InspectorTab; label: string }> = [
  { id: "content", label: "Content" }, { id: "design", label: "Design" }, { id: "background", label: "Background" },
  { id: "layout", label: "Layout" }, { id: "animation", label: "Animation" }, { id: "responsive", label: "Responsive" }, { id: "ai", label: "AI Generate" },
];

function temporaryId() { return `temp-${crypto.randomUUID()}`; }
function jsonObject<T extends object>(value: unknown, fallback: T): T { return value && typeof value === "object" && !Array.isArray(value) ? value as T : fallback; }

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Permintaan gagal.");
  return payload as T;
}

function payloadForPage(page: BuilderPage, versionLabel?: string) {
  return {
    name: page.name, pageType: page.pageType, heightMode: page.heightMode, backgroundConfig: page.backgroundConfig,
    layoutConfig: page.layoutConfig, responsiveConfig: page.responsiveConfig, animationConfig: page.animationConfig, isVisible: page.isVisible,
    blocks: page.blocks.map((block) => ({
      ...block,
      id: block.id.startsWith("temp-") ? undefined : block.id,
      pageId: undefined,
    })),
    versionLabel,
  };
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") return <span className="builder-save-state is-saving"><LoaderCircle className="animate-spin" size={14} />Saving</span>;
  if (state === "failed") return <span className="builder-save-state is-failed"><X size={14} />Failed to save</span>;
  if (state === "saved") return <span className="builder-save-state"><Check size={14} />Saved</span>;
  return <span className="builder-save-state"><Save size={14} />Autosave</span>;
}

export function InvitationBuilder({ event, initialDocument }: { event: BuilderRenderEvent & { id: string }; initialDocument: BuilderDocument }) {
  const [pages, setPages] = useState(initialDocument.pages);
  const [activePageId, setActivePageId] = useState(initialDocument.pages[0]?.id ?? "");
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [viewport, setViewport] = useState<BuilderViewport>("mobile");
  const [zoom, setZoom] = useState(82);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [editorMode, setEditorMode] = useState<"simple" | "ai">("simple");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [aiPagePrompt, setAiPagePrompt] = useState("Buat halaman cover pernikahan Jawa yang elegan. Gunakan pendopo malam dan gunungan emas. Nama pengantin berada di tengah, tanggal di bawah nama, dan tombol Buka Undangan di bawah.");
  const [aiPreview, setAiPreview] = useState<AllowedPageConfig | PagePatch>();
  const [aiPreviewMode, setAiPreviewMode] = useState<"create" | "edit">("create");
  const [imagePrompt, setImagePrompt] = useState("Latar undangan pernikahan editorial yang elegan, bunga putih tipis di tepi, area kosong luas di tengah, tanpa teks dan tanpa logo");
  const [imagePurpose, setImagePurpose] = useState<(typeof ASSET_PURPOSES)[number]>("background");
  const [aspectRatio, setAspectRatio] = useState<(typeof ASPECT_RATIOS)[number]>("9:16");
  const [imageStyle, setImageStyle] = useState("romantic-editorial");
  const [imageColors, setImageColors] = useState("#203a34, #d3b77c, #f5efe3");
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const selectedBlock = activePage?.blocks.find((block) => block.id === selectedBlockId);

  useEffect(() => () => { saveTimers.current.forEach((timer) => clearTimeout(timer)); }, []);

  const replacePage = (page: BuilderPage) => {
    startTransition(() => setPages((current) => current.map((item) => item.id === page.id ? page : item)));
    if (selectedBlockId?.startsWith("temp-")) setSelectedBlockId(undefined);
  };

  const savePage = async (page: BuilderPage, versionLabel?: string) => {
    setSaveState("saving");
    try {
      const saved = await api<BuilderPage>(`/api/events/${event.id}/builder/pages/${page.id}`, { method: "PATCH", body: JSON.stringify(payloadForPage(page, versionLabel)) });
      replacePage(saved); setSaveState("saved");
    } catch (error) { setSaveState("failed"); setMessage(error instanceof Error ? error.message : "Autosave gagal."); }
  };

  const scheduleSave = (page: BuilderPage, versionLabel?: string) => {
    const existing = saveTimers.current.get(page.id); if (existing) clearTimeout(existing);
    setSaveState("saving");
    saveTimers.current.set(page.id, setTimeout(() => { saveTimers.current.delete(page.id); void savePage(page, versionLabel); }, versionLabel ? 150 : 700));
  };

  const updatePageById = (pageId: string, updater: (page: BuilderPage) => BuilderPage, versionLabel?: string) => {
    const currentPage = pages.find((page) => page.id === pageId);
    if (!currentPage) return;
    const next = updater(currentPage);
    setPages((current) => current.map((page) => page.id === next.id ? next : page));
    scheduleSave(next, versionLabel);
  };

  const updateActivePage = (updater: (page: BuilderPage) => BuilderPage, versionLabel?: string) => updatePageById(activePage?.id ?? "", updater, versionLabel);

  const updateBlock = (blockId: string, updater: (block: BuilderBlock) => BuilderBlock, versionLabel?: string) => updateActivePage((page) => ({ ...page, blocks: page.blocks.map((block) => block.id === blockId ? updater(block) : block) }), versionLabel);

  const refreshPage = async (pageId = activePageId) => {
    const page = await api<BuilderPage>(`/api/events/${event.id}/builder/pages/${pageId}`); replacePage(page); return page;
  };

  const addPage = async (pageType: PageType) => {
    setBusy(true); setMessage("");
    try {
      const page = await api<BuilderPage>(`/api/events/${event.id}/builder/pages`, { method: "POST", body: JSON.stringify({ action: "create", pageType }) });
      setPages((current) => [...current, page]); setActivePageId(page.id); setSelectedBlockId(undefined); setShowAddPage(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Halaman gagal dibuat."); }
    finally { setBusy(false); }
  };

  const duplicatePage = async (pageId: string) => {
    setBusy(true);
    try { const page = await api<BuilderPage>(`/api/events/${event.id}/builder/pages`, { method: "POST", body: JSON.stringify({ action: "duplicate", pageId }) }); setPages((current) => [...current, page]); setActivePageId(page.id); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Duplikasi gagal."); } finally { setBusy(false); }
  };

  const removePage = async (pageId: string) => {
    if (!window.confirm("Hapus halaman ini? Perubahan ini tidak dapat dibatalkan dari editor.")) return;
    setBusy(true);
    try { await api(`/api/events/${event.id}/builder/pages/${pageId}`, { method: "DELETE" }); const next = pages.filter((page) => page.id !== pageId); setPages(next); setActivePageId(next[0]?.id ?? ""); setSelectedBlockId(undefined); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Halaman gagal dihapus."); } finally { setBusy(false); }
  };

  const reorderPage = async (index: number, direction: -1 | 1) => {
    const destination = index + direction; if (destination < 0 || destination >= pages.length) return;
    const previous = pages; const next = [...pages]; [next[index], next[destination]] = [next[destination], next[index]];
    const ordered = next.map((page, order) => ({ ...page, order })); setPages(ordered);
    try { await api(`/api/events/${event.id}/builder/pages`, { method: "POST", body: JSON.stringify({ action: "reorder", pageIds: ordered.map((page) => page.id) }) }); }
    catch (error) { setPages(previous); setMessage(error instanceof Error ? error.message : "Urutan gagal disimpan."); }
  };

  const addBlock = (blockType: (typeof BLOCK_TYPES)[number]) => {
    if (!activePage) return;
    const definition = BLOCK_REGISTRY[blockType];
    const block: BuilderBlock = { id: temporaryId(), pageId: activePage.id, blockType, content: definition.defaultContent, dataBinding: null, positionConfig: { layoutPreset: "stack", width: 86, maxWidth: 720 }, styleConfig: blockType === "heading" ? { fontSize: 44, fontFamily: "serif", textAlign: "center" } : { textAlign: "center" }, responsiveConfig: {}, animationConfig: { preset: "rise", duration: 500 }, order: activePage.blocks.length, isVisible: true };
    updateActivePage((page) => ({ ...page, blocks: [...page.blocks, block] }), `Sebelum menambah ${definition.label}`); setSelectedBlockId(block.id);
  };

  const removeBlock = (blockId: string) => { updateActivePage((page) => ({ ...page, blocks: page.blocks.filter((block) => block.id !== blockId).map((block, order) => ({ ...block, order })) }), "Sebelum menghapus block"); setSelectedBlockId(undefined); };

  const moveBlock = (blockId: string, direction: -1 | 1) => updateActivePage((page) => {
    const blocks = [...page.blocks]; const index = blocks.findIndex((block) => block.id === blockId); const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= blocks.length) return page;
    [blocks[index], blocks[destination]] = [blocks[destination], blocks[index]];
    return { ...page, blocks: blocks.map((block, order) => ({ ...block, order })) };
  });

  const generatePage = async (mode: "create" | "edit") => {
    setBusy(true); setMessage(""); setAiPreview(undefined);
    try {
      const response = await api<{ result: AllowedPageConfig | PagePatch }>(`/api/events/${event.id}/builder/generate-page`, { method: "POST", headers: { "Idempotency-Key": `page:${crypto.randomUUID()}` }, body: JSON.stringify({ prompt: aiPagePrompt, mode, pageId: mode === "edit" ? activePage?.id : undefined }) });
      setAiPreview(response.result); setAiPreviewMode(mode);
    } catch (error) { setMessage(error instanceof Error ? error.message : "AI tidak dapat membuat preview."); }
    finally { setBusy(false); }
  };

  const applyAiPreview = async () => {
    if (!aiPreview) return; setBusy(true);
    try {
      if (aiPreviewMode === "create") {
        const page = await api<BuilderPage>(`/api/events/${event.id}/builder/pages`, { method: "POST", body: JSON.stringify({ action: "create-ai", config: aiPreview }) });
        setPages((current) => [...current, page]); setActivePageId(page.id);
      } else if (activePage) {
        const page = await api<BuilderPage>(`/api/events/${event.id}/builder/pages/${activePage.id}`, { method: "PATCH", body: JSON.stringify({ action: "apply-ai-patch", patch: aiPreview }) }); replacePage(page);
      }
      setAiPreview(undefined); setMessage("Perubahan AI diterapkan dan versi sebelumnya disimpan.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Preview AI gagal diterapkan."); }
    finally { setBusy(false); }
  };

  const generateImages = async () => {
    if (!activePage) return; setBusy(true); setMessage("");
    try {
      const response = await api<{ results: GenerationResult[] }>(`/api/events/${event.id}/builder/generate-image`, { method: "POST", headers: { "Idempotency-Key": `image:${crypto.randomUUID()}` }, body: JSON.stringify({ pageId: activePage.id, input: { prompt: imagePrompt, purpose: imagePurpose, aspectRatio, stylePreset: imageStyle, dominantColors: imageColors.split(",").map((color) => color.trim()).filter(Boolean), safeArea: { horizontal: "center", vertical: "center" }, numberOfResults: 3 } }) });
      setGenerationResults(response.results); await refreshPage(activePage.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Generate gambar gagal."); }
    finally { setBusy(false); }
  };

  const applyAsset = async (assetId: string, action: "background" | "image") => {
    setBusy(true);
    try { const page = await api<BuilderPage>(`/api/events/${event.id}/builder/assets/${assetId}`, { method: "PATCH", body: JSON.stringify({ action }) }); replacePage(page); setMessage(action === "background" ? "Background AI sudah digunakan." : "Gambar AI ditambahkan ke canvas."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Aset gagal digunakan."); } finally { setBusy(false); }
  };

  const loadVersions = async () => { if (!activePage) return; setShowVersions(true); setVersions(await api<Version[]>(`/api/events/${event.id}/builder/pages/${activePage.id}/versions`)); };
  const restoreVersion = async (versionId: string) => { if (!activePage || !window.confirm("Pulihkan versi ini? Kondisi saat ini tetap disimpan sebagai versi baru.")) return; setBusy(true); try { const page = await api<BuilderPage>(`/api/events/${event.id}/builder/pages/${activePage.id}/versions`, { method: "POST", body: JSON.stringify({ versionId }) }); replacePage(page); setShowVersions(false); } catch (error) { setMessage(error instanceof Error ? error.message : "Versi gagal dipulihkan."); } finally { setBusy(false); } };

  if (!activePage) return <div className="card p-6">Builder belum memiliki halaman.</div>;

  const activeBackground = jsonObject<Record<string, unknown>>(activePage.backgroundConfig, {});
  const activeLayout = jsonObject<Record<string, unknown>>(activePage.layoutConfig, {});
  const blockStyle = jsonObject<Record<string, unknown>>(selectedBlock?.styleConfig, {});
  const blockPosition = jsonObject<Record<string, unknown>>(selectedBlock?.positionConfig, {});
  const blockAnimation = jsonObject<Record<string, unknown>>(selectedBlock?.animationConfig, {});
  const blockResponsive = jsonObject<Record<string, unknown>>(selectedBlock?.responsiveConfig, {});

  return <div className="builder-shell">
    <header className="builder-toolbar">
      <div className="builder-toolbar-title"><Link href={`/dashboard/events/${event.id}`} aria-label="Kembali ke ringkasan"><ArrowLeft size={18} /></Link><div><small>AI Invitation Builder</small><strong>{event.title}</strong></div></div>
      <div className="builder-mode-switch"><button className={editorMode === "simple" ? "is-active" : ""} onClick={() => { setEditorMode("simple"); if (inspectorTab === "ai") setInspectorTab("content"); }}>Simple Mode</button><button className={editorMode === "ai" ? "is-active" : ""} onClick={() => { setEditorMode("ai"); setInspectorTab("ai"); }}><Sparkles size={14} />AI Mode</button></div>
      <div className="builder-toolbar-actions"><SaveIndicator state={saveState} /><button className="builder-icon-button" title="Version history" onClick={() => void loadVersions()}><Clock3 size={17} /></button><Link className="builder-preview-link" href={`/dashboard/events/${event.id}/preview`} target="_blank"><Eye size={16} />Preview</Link></div>
    </header>

    {message && <div className="builder-message" role="status"><span>{message}</span><button onClick={() => setMessage("")}><X size={15} /></button></div>}

    <div className="builder-workspace">
      <aside className="builder-pages-panel">
        <div className="builder-panel-heading"><div><span>STRUKTUR</span><strong>{pages.length} halaman</strong></div><button onClick={() => setShowAddPage((value) => !value)}><Plus size={16} /></button></div>
        {showAddPage && <div className="builder-page-picker"><p>Pilih jenis halaman</p><div>{PAGE_TYPES.map((type) => <button disabled={busy} key={type} onClick={() => void addPage(type)}><span>{PAGE_TYPE_LABELS[type]}</span><small>{type}</small></button>)}</div></div>}
        <div className="builder-page-list">
          {[...pages].sort((left, right) => left.order - right.order).map((page, index) => <article className={page.id === activePage.id ? "is-active" : ""} key={page.id} onClick={() => { setActivePageId(page.id); setSelectedBlockId(undefined); }}>
            <span className="builder-page-number">{String(index + 1).padStart(2, "0")}</span><div className="builder-page-copy"><strong>{page.name}</strong><small>{PAGE_TYPE_LABELS[page.pageType]} · {page.blocks.length} block</small></div>{!page.isVisible && <EyeOff className="builder-page-hidden" size={14} />}
            <div className="builder-page-actions"><button title="Naik" disabled={index === 0} onClick={(click) => { click.stopPropagation(); void reorderPage(index, -1); }}><ArrowUp size={13} /></button><button title="Turun" disabled={index === pages.length - 1} onClick={(click) => { click.stopPropagation(); void reorderPage(index, 1); }}><ArrowDown size={13} /></button><button title="Duplikat" onClick={(click) => { click.stopPropagation(); void duplicatePage(page.id); }}><Copy size={13} /></button><button title={page.isVisible ? "Sembunyikan" : "Tampilkan"} onClick={(click) => { click.stopPropagation(); updatePageById(page.id, (current) => ({ ...current, isVisible: !current.isVisible }), "Sebelum mengubah visibilitas"); }}>{page.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}</button><button title="Hapus" onClick={(click) => { click.stopPropagation(); void removePage(page.id); }}><Trash2 size={13} /></button></div>
          </article>)}
        </div>
        <button className="builder-add-page" onClick={() => setShowAddPage(true)}><Plus size={16} />Tambah halaman</button>
        <button className="builder-ai-page-button" onClick={() => { setEditorMode("ai"); setInspectorTab("ai"); setAiPreviewMode("create"); }}><WandSparkles size={16} />Create Page with AI</button>
      </aside>

      <main className="builder-canvas-area">
        <div className="builder-canvas-controls"><div className="builder-device-switch"><button className={viewport === "mobile" ? "is-active" : ""} title="Mobile" onClick={() => setViewport("mobile")}><Smartphone size={16} /></button><button className={viewport === "tablet" ? "is-active" : ""} title="Tablet" onClick={() => setViewport("tablet")}><Tablet size={16} /></button><button className={viewport === "desktop" ? "is-active" : ""} title="Desktop" onClick={() => setViewport("desktop")}><Monitor size={16} /></button></div><div className="builder-zoom"><button onClick={() => setZoom((value) => Math.max(45, value - 10))}>−</button><span>{zoom}%</span><button onClick={() => setZoom((value) => Math.min(120, value + 10))}>+</button></div></div>
        <div className="builder-canvas-stage" onClick={() => setSelectedBlockId(undefined)}>
          <div className={`builder-device-frame is-${viewport}`} style={{ transform: `scale(${zoom / 100})` }}>
            <div className="builder-device-top"><span /><span>{viewport === "mobile" ? "Mobile preview" : viewport === "tablet" ? "Tablet preview" : "Desktop preview"}</span><span /></div>
            <BuilderPageCanvas page={activePage} event={event} viewport={viewport} isEditor selectedBlockId={selectedBlockId} onSelectBlock={setSelectedBlockId} onTextChange={(id, text) => updateBlock(id, (block) => ({ ...block, dataBinding: null, content: { ...block.content, text } }))} onBlockDrop={(id, x, y) => updateBlock(id, (block) => ({ ...block, positionConfig: { ...block.positionConfig, x: Math.round(x), y: Math.round(y) } }), "Sebelum memindahkan block")} />
          </div>
        </div>
        <p className="builder-canvas-hint">Klik block untuk mengedit. Seret block untuk posisi bebas terbatas. Teks dapat diedit langsung pada canvas.</p>
      </main>

      <aside className="builder-inspector">
        <div className="builder-inspector-tabs">{tabs.filter((tab) => editorMode === "ai" || tab.id !== "ai").map((tab) => <button className={inspectorTab === tab.id ? "is-active" : ""} key={tab.id} onClick={() => setInspectorTab(tab.id)}>{tab.label}</button>)}</div>
        <div className="builder-inspector-body">
          {inspectorTab === "content" && <ContentPanel page={activePage} selectedBlock={selectedBlock} onSelect={setSelectedBlockId} onAdd={addBlock} onRemove={removeBlock} onMove={moveBlock} onUpdate={(updater) => selectedBlock && updateBlock(selectedBlock.id, updater)} onPageName={(name) => updateActivePage((page) => ({ ...page, name }))} onPageType={(pageType) => updateActivePage((page) => ({ ...page, pageType }), "Sebelum mengganti jenis halaman")} />}
          {inspectorTab === "design" && <InspectorSection eyebrow="DESIGN SYSTEM" title={selectedBlock ? "Gaya block" : "Pilih sebuah block"}>{selectedBlock && <><ColorField label="Warna teks" value={String(blockStyle.color ?? "#20251f")} onChange={(color) => updateBlock(selectedBlock.id, (block) => ({ ...block, styleConfig: { ...block.styleConfig, color } }))} /><label>Ukuran font <output>{Number(blockStyle.fontSize ?? (selectedBlock.blockType === "heading" ? 44 : 16))}px</output><input type="range" min="10" max="96" value={Number(blockStyle.fontSize ?? (selectedBlock.blockType === "heading" ? 44 : 16))} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, styleConfig: { ...block.styleConfig, fontSize: Number(change.target.value) } }))} /></label><label>Jenis font<select value={String(blockStyle.fontFamily ?? "body")} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, styleConfig: { ...block.styleConfig, fontFamily: change.target.value as "body" } }))}><option value="body">Modern Sans</option><option value="serif">Editorial Serif</option><option value="display">Display</option></select></label><label>Alignment<select value={String(blockStyle.textAlign ?? "center")} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, styleConfig: { ...block.styleConfig, textAlign: change.target.value as "center" } }))}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></label></>}</InspectorSection>}
          {inspectorTab === "background" && <InspectorSection eyebrow="BACKGROUND" title="Atmosfer halaman"><ColorField label="Warna dasar" value={String(activeBackground.color ?? "#f3eee5")} onChange={(color) => updateActivePage((page) => ({ ...page, backgroundConfig: { ...page.backgroundConfig, color } }))} /><ColorField label="Warna overlay" value={String(activeBackground.overlayColor ?? "#131712")} onChange={(overlayColor) => updateActivePage((page) => ({ ...page, backgroundConfig: { ...page.backgroundConfig, overlayColor } }))} /><label>Opacity overlay <output>{Math.round(Number(activeBackground.overlayOpacity ?? 0) * 100)}%</output><input type="range" min="0" max="100" value={Number(activeBackground.overlayOpacity ?? 0) * 100} onChange={(change) => updateActivePage((page) => ({ ...page, backgroundConfig: { ...page.backgroundConfig, overlayOpacity: Number(change.target.value) / 100 } }))} /></label><label>Posisi fokus X <output>{Number(activeBackground.positionX ?? 50)}%</output><input type="range" min="0" max="100" value={Number(activeBackground.positionX ?? 50)} onChange={(change) => updateActivePage((page) => ({ ...page, backgroundConfig: { ...page.backgroundConfig, positionX: Number(change.target.value) } }))} /></label><button className="builder-secondary-button" onClick={() => { setEditorMode("ai"); setInspectorTab("ai"); }}><ImagePlus size={15} />Generate background AI</button></InspectorSection>}
          {inspectorTab === "layout" && <InspectorSection eyebrow="LAYOUT" title="Ukuran dan posisi"><label>Tinggi halaman<select value={activePage.heightMode} onChange={(change) => updateActivePage((page) => ({ ...page, heightMode: change.target.value as typeof page.heightMode }), "Sebelum mengganti tinggi halaman")}>{HEIGHT_MODES.map((mode) => <option key={mode} value={mode}>{mode}</option>)}</select></label><label>Preset layout<select value={String(activeLayout.preset ?? "center")} onChange={(change) => updateActivePage((page) => ({ ...page, layoutConfig: { ...page.layoutConfig, preset: change.target.value } }))}><option value="center">Center</option><option value="editorial">Editorial</option><option value="split">Split</option><option value="stack">Stack</option><option value="airy">Airy</option></select></label><label>Jarak block <output>{Number(activeLayout.gap ?? 14)}px</output><input type="range" min="0" max="64" value={Number(activeLayout.gap ?? 14)} onChange={(change) => updateActivePage((page) => ({ ...page, layoutConfig: { ...page.layoutConfig, gap: Number(change.target.value) } }))} /></label>{selectedBlock && <><hr /><p className="builder-field-caption">POSISI BLOCK</p><label>Lebar <output>{Number(blockPosition.width ?? 86)}%</output><input type="range" min="20" max="100" value={Number(blockPosition.width ?? 86)} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, positionConfig: { ...block.positionConfig, width: Number(change.target.value) } }))} /></label><div className="builder-position-grid"><label>X (%)<input type="number" min="0" max="100" value={Number(blockPosition.x ?? 50)} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, positionConfig: { ...block.positionConfig, x: Number(change.target.value) } }))} /></label><label>Y (%)<input type="number" min="0" max="100" value={Number(blockPosition.y ?? 50)} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, positionConfig: { ...block.positionConfig, y: Number(change.target.value) } }))} /></label></div><button className="builder-text-button" onClick={() => updateBlock(selectedBlock.id, (block) => ({ ...block, positionConfig: { ...block.positionConfig, x: undefined, y: undefined } }))}>Kembalikan ke flow layout</button></>}</InspectorSection>}
          {inspectorTab === "animation" && <InspectorSection eyebrow="MOTION" title="Animasi masuk">{selectedBlock ? <><label>Preset<select value={String(blockAnimation.preset ?? "rise")} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, animationConfig: { ...block.animationConfig, preset: change.target.value as "rise" } }))}>{["none", "fade", "rise", "scale", "slide-left", "slide-right"].map((preset) => <option key={preset}>{preset}</option>)}</select></label><label>Durasi <output>{Number(blockAnimation.duration ?? 500)}ms</output><input type="range" min="100" max="2000" step="50" value={Number(blockAnimation.duration ?? 500)} onChange={(change) => updateBlock(selectedBlock.id, (block) => ({ ...block, animationConfig: { ...block.animationConfig, duration: Number(change.target.value) } }))} /></label></> : <p className="builder-empty-note">Pilih block untuk mengatur animasi.</p>}</InspectorSection>}
          {inspectorTab === "responsive" && <InspectorSection eyebrow="RESPONSIVE" title="Kontrol per perangkat">{selectedBlock ? <><p className="builder-empty-note">Sembunyikan block pada perangkat tertentu.</p>{(["mobile", "tablet", "desktop"] as BuilderViewport[]).map((device) => { const hidden = Array.isArray(blockResponsive.hiddenOn) && blockResponsive.hiddenOn.includes(device); return <label className="builder-toggle-row" key={device}><span>{device === "mobile" ? <Smartphone size={16} /> : device === "tablet" ? <Tablet size={16} /> : <Laptop size={16} />}{device}</span><input type="checkbox" checked={!hidden} onChange={() => updateBlock(selectedBlock.id, (block) => { const current = block.responsiveConfig.hiddenOn ?? []; return { ...block, responsiveConfig: { ...block.responsiveConfig, hiddenOn: hidden ? current.filter((item) => item !== device) : [...current, device] } }; })} /></label>; })}</> : <p className="builder-empty-note">Pilih block untuk membuat override responsif.</p>}</InspectorSection>}
          {inspectorTab === "ai" && <AIInspector busy={busy} pagePrompt={aiPagePrompt} setPagePrompt={setAiPagePrompt} onGeneratePage={generatePage} preview={aiPreview} previewMode={aiPreviewMode} onApply={applyAiPreview} onDismiss={() => setAiPreview(undefined)} imagePrompt={imagePrompt} setImagePrompt={setImagePrompt} purpose={imagePurpose} setPurpose={setImagePurpose} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} imageStyle={imageStyle} setImageStyle={setImageStyle} colors={imageColors} setColors={setImageColors} onGenerateImages={generateImages} results={generationResults} assets={activePage.assets} onApplyAsset={applyAsset} />}
        </div>
      </aside>
    </div>

    {showVersions && <div className="builder-drawer-backdrop" onClick={() => setShowVersions(false)}><aside className="builder-history-drawer" onClick={(click) => click.stopPropagation()}><header><div><span>VERSION HISTORY</span><h2>{activePage.name}</h2></div><button onClick={() => setShowVersions(false)}><X size={18} /></button></header><p>Snapshot besar disimpan otomatis. Paket Anda menyimpan versi terbaru sesuai batas paket.</p><div>{versions.length ? versions.map((version) => <article key={version.id}><span className={version.source === "ai" ? "is-ai" : ""}>{version.source === "ai" ? <Sparkles size={13} /> : <Clock3 size={13} />}</span><div><strong>{version.label}</strong><small>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.createdAt))}</small></div><button disabled={busy} onClick={() => void restoreVersion(version.id)}><Undo2 size={14} />Restore</button></article>) : <div className="builder-history-empty"><Clock3 size={30} /><p>Belum ada snapshot untuk halaman ini.</p></div>}</div></aside></div>}
  </div>;
}

function InspectorSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="builder-inspector-section"><span>{eyebrow}</span><h2>{title}</h2><div>{children}</div></section>; }

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label>{label}<span className="builder-color-field"><input type="color" value={value.startsWith("#") ? value.slice(0, 7) : "#20251f"} onChange={(change) => onChange(change.target.value)} /><input value={value} onChange={(change) => onChange(change.target.value)} /></span></label>; }

function ContentPanel({ page, selectedBlock, onSelect, onAdd, onRemove, onMove, onUpdate, onPageName, onPageType }: { page: BuilderPage; selectedBlock?: BuilderBlock; onSelect: (id: string) => void; onAdd: (type: (typeof BLOCK_TYPES)[number]) => void; onRemove: (id: string) => void; onMove: (id: string, direction: -1 | 1) => void; onUpdate: (updater: (block: BuilderBlock) => BuilderBlock) => void; onPageName: (value: string) => void; onPageType: (type: PageType) => void }) {
  const [showBlocks, setShowBlocks] = useState(false);
  return <InspectorSection eyebrow="PAGE CONTENT" title={page.name}><label>Nama halaman<input value={page.name} maxLength={100} onChange={(change) => onPageName(change.target.value)} /></label><label>Jenis halaman<select value={page.pageType} onChange={(change) => onPageType(change.target.value as PageType)}>{PAGE_TYPES.map((type) => <option key={type} value={type}>{PAGE_TYPE_LABELS[type]}</option>)}</select></label><div className="builder-block-list-header"><p>Blocks</p><button onClick={() => setShowBlocks((value) => !value)}><Plus size={14} />Add block</button></div>{showBlocks && <div className="builder-block-picker">{BLOCK_DEFINITIONS.map((definition) => <button key={definition.type} onClick={() => { onAdd(definition.type); setShowBlocks(false); }}><Plus size={13} /><span>{definition.label}</span><small>{definition.group}</small></button>)}</div>}<div className="builder-layer-list">{[...page.blocks].sort((left, right) => left.order - right.order).map((block, index) => <article className={selectedBlock?.id === block.id ? "is-active" : ""} key={block.id} onClick={() => onSelect(block.id)}><span>{index + 1}</span><div><strong>{BLOCK_REGISTRY[block.blockType].label}</strong><small>{block.dataBinding || block.content.text || block.content.label || block.blockType}</small></div><div><button disabled={index === 0} onClick={(click) => { click.stopPropagation(); onMove(block.id, -1); }}><ArrowUp size={12} /></button><button disabled={index === page.blocks.length - 1} onClick={(click) => { click.stopPropagation(); onMove(block.id, 1); }}><ArrowDown size={12} /></button></div></article>)}</div>{selectedBlock && <div className="builder-selected-content"><div className="builder-selected-heading"><strong>{BLOCK_REGISTRY[selectedBlock.blockType].label}</strong><button onClick={() => onRemove(selectedBlock.id)}><Trash2 size={14} />Hapus</button></div>{["heading", "text"].includes(selectedBlock.blockType) && <label>Teks<textarea rows={4} value={selectedBlock.content.text ?? ""} onChange={(change) => onUpdate((block) => ({ ...block, dataBinding: null, content: { ...block.content, text: change.target.value } }))} /></label>}{["button", "open-invitation-button", "maps-button", "calendar-button", "social-link"].includes(selectedBlock.blockType) && <label>Label<input value={selectedBlock.content.label ?? ""} onChange={(change) => onUpdate((block) => ({ ...block, content: { ...block.content, label: change.target.value } }))} /></label>}{["image", "generated-image", "decorative-image", "video", "button", "social-link"].includes(selectedBlock.blockType) && <label>URL<input value={selectedBlock.content.url ?? ""} onChange={(change) => onUpdate((block) => ({ ...block, content: { ...block.content, url: change.target.value } }))} /></label>}<label className="builder-toggle-row"><span><Eye size={15} />Tampilkan block</span><input type="checkbox" checked={selectedBlock.isVisible} onChange={() => onUpdate((block) => ({ ...block, isVisible: !block.isVisible }))} /></label></div>}</InspectorSection>;
}

function AIInspector({ busy, pagePrompt, setPagePrompt, onGeneratePage, preview, previewMode, onApply, onDismiss, imagePrompt, setImagePrompt, purpose, setPurpose, aspectRatio, setAspectRatio, imageStyle, setImageStyle, colors, setColors, onGenerateImages, results, assets, onApplyAsset }: {
  busy: boolean; pagePrompt: string; setPagePrompt: (value: string) => void; onGeneratePage: (mode: "create" | "edit") => void; preview?: AllowedPageConfig | PagePatch; previewMode: "create" | "edit"; onApply: () => void; onDismiss: () => void;
  imagePrompt: string; setImagePrompt: (value: string) => void; purpose: (typeof ASSET_PURPOSES)[number]; setPurpose: (value: (typeof ASSET_PURPOSES)[number]) => void; aspectRatio: (typeof ASPECT_RATIOS)[number]; setAspectRatio: (value: (typeof ASPECT_RATIOS)[number]) => void; imageStyle: string; setImageStyle: (value: string) => void; colors: string; setColors: (value: string) => void; onGenerateImages: () => void; results: GenerationResult[]; assets: BuilderPage["assets"]; onApplyAsset: (assetId: string, action: "background" | "image") => void;
}) {
  const resultAssets = results.map((result) => ({ result, asset: assets.find((asset) => asset.id === result.pageAssetId) })).filter((item) => item.asset);
  return <div className="builder-ai-panel"><div className="builder-ai-intro"><span><Sparkles size={16} /></span><div><strong>Zenvora Creative AI</strong><small>Structured output · aman tanpa HTML</small></div></div><section><div className="builder-ai-section-title"><span>01</span><div><strong>Generate or edit page</strong><small>AI menyusun konfigurasi tervalidasi</small></div></div><label>Instruksi<textarea rows={7} value={pagePrompt} onChange={(change) => setPagePrompt(change.target.value)} /></label><div className="builder-ai-actions"><button disabled={busy} onClick={() => onGeneratePage("create")}><WandSparkles size={15} />Create new</button><button disabled={busy} className="secondary" onClick={() => onGeneratePage("edit")}><Redo2 size={15} />Edit current</button></div>{preview && <div className="builder-ai-preview"><header><span>Preview patch</span><strong>{previewMode === "create" ? "Halaman baru" : "Perubahan halaman aktif"}</strong></header><pre>{JSON.stringify(preview, null, 2)}</pre><footer><button className="secondary" onClick={onDismiss}>Batal</button><button disabled={busy} onClick={onApply}><Check size={14} />Apply preview</button></footer></div>}</section><section><div className="builder-ai-section-title"><span>02</span><div><strong>Generate visual</strong><small>Mock provider gratis untuk development</small></div></div><label>Prompt gambar<textarea rows={5} value={imagePrompt} onChange={(change) => setImagePrompt(change.target.value)} /></label><div className="builder-form-grid"><label>Tujuan<select value={purpose} onChange={(change) => setPurpose(change.target.value as typeof purpose)}>{ASSET_PURPOSES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Aspect ratio<select value={aspectRatio} onChange={(change) => setAspectRatio(change.target.value as typeof aspectRatio)}>{ASPECT_RATIOS.map((item) => <option key={item}>{item}</option>)}</select></label></div><label>Style preset<input value={imageStyle} onChange={(change) => setImageStyle(change.target.value)} /></label><label>Warna dominan<input value={colors} onChange={(change) => setColors(change.target.value)} /></label><button className="builder-generate-button" disabled={busy} onClick={onGenerateImages}>{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Sparkles size={16} />}Generate 3 variations <span>0 credit</span></button>{resultAssets.length > 0 && <div className="builder-generation-grid">{resultAssets.map(({ result, asset }) => <article key={result.id}><img src={result.url} alt="Hasil background AI" /><div><button onClick={() => onApplyAsset(asset!.id, "background")}>Background</button><button onClick={() => onApplyAsset(asset!.id, "image")}>Add image</button></div></article>)}</div>}</section></div>;
}
