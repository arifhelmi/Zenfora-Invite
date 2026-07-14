import { z } from "zod";
import { ASPECT_RATIOS, ASSET_PURPOSES, BLOCK_TYPES, HEIGHT_MODES, PAGE_TYPES } from "@/features/builder/types";

const safeText = (max: number, min = 0) => z.string().trim().min(min).max(max).refine((value) => !/<\/?(?:script|iframe|object|embed|style)[\s>]/i.test(value), "Konten tidak aman.");
const color = z.string().regex(/^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|[a-z-]{3,30})$/i).max(64);

export const blockContentSchema = z.object({
  text: safeText(4000).optional(),
  label: safeText(120).optional(),
  url: z.string().max(2000).refine((value) => value.startsWith("/") || value.startsWith("#") || /^https?:\/\//i.test(value), "URL tidak aman.").optional(),
  alt: safeText(240).optional(),
  items: z.array(safeText(500)).max(50).optional(),
});

export const positionConfigSchema = z.object({
  layoutPreset: z.string().max(80).optional(),
  alignment: z.enum(["left", "center", "right", "stretch"]).optional(),
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  width: z.number().min(10).max(100).optional(),
  maxWidth: z.number().min(120).max(1600).optional(),
});

export const styleConfigSchema = z.object({
  stylePreset: z.string().max(80).optional(),
  color: color.optional(),
  backgroundColor: color.optional(),
  fontSize: z.number().min(10).max(160).optional(),
  fontWeight: z.number().min(100).max(900).optional(),
  fontFamily: z.enum(["display", "body", "serif"]).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  borderRadius: z.number().min(0).max(999).optional(),
  padding: z.number().min(0).max(120).optional(),
  opacity: z.number().min(0).max(1).optional(),
});

const responsiveOverrideSchema = positionConfigSchema.merge(styleConfigSchema).partial();
export const responsiveConfigSchema = z.object({
  hiddenOn: z.array(z.enum(["mobile", "tablet", "desktop"])).max(3).optional(),
  mobile: responsiveOverrideSchema.optional(),
  tablet: responsiveOverrideSchema.optional(),
  desktop: responsiveOverrideSchema.optional(),
});

export const animationConfigSchema = z.object({
  preset: z.enum(["none", "fade", "rise", "scale", "slide-left", "slide-right"]).optional(),
  duration: z.number().min(100).max(5000).optional(),
  delay: z.number().min(0).max(5000).optional(),
});

export const backgroundConfigSchema = z.object({
  assetId: z.string().cuid().optional(),
  url: z.string().max(2000).refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "URL tidak aman.").optional(),
  size: z.enum(["cover", "contain", "auto"]).default("cover"),
  positionX: z.number().min(0).max(100).default(50),
  positionY: z.number().min(0).max(100).default(50),
  overlayColor: color.optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  blur: z.number().min(0).max(30).optional(),
  color: color.optional(),
});

export const imageGenerationInputSchema = z.object({
  prompt: safeText(1000, 8),
  negativePrompt: safeText(500).optional(),
  purpose: z.enum(ASSET_PURPOSES),
  aspectRatio: z.enum(ASPECT_RATIOS),
  stylePreset: z.string().trim().max(80).optional(),
  dominantColors: z.array(color).max(6).optional(),
  safeArea: z.object({
    horizontal: z.enum(["left", "center", "right"]),
    vertical: z.enum(["top", "center", "bottom"]),
  }).optional(),
  numberOfResults: z.number().int().min(1).max(4),
});

export const allowedBlockConfigSchema = z.object({
  type: z.enum(BLOCK_TYPES),
  content: blockContentSchema.optional(),
  dataBinding: z.enum(["event.title", "event.description", "event.coupleNames", "event.primaryDate", "event.location", "event.locationAddress"]).optional(),
  layoutPreset: z.string().max(80).optional(),
  stylePreset: z.string().max(80).optional(),
  positionConfig: positionConfigSchema.optional(),
  styleConfig: styleConfigSchema.optional(),
  responsiveConfig: responsiveConfigSchema.optional(),
  animationConfig: animationConfigSchema.optional(),
});

export const allowedPageConfigSchema = z.object({
  name: safeText(100).optional(),
  pageType: z.enum(PAGE_TYPES),
  heightMode: z.enum(HEIGHT_MODES),
  backgroundConfig: backgroundConfigSchema.partial().optional(),
  layoutConfig: z.object({
    preset: z.enum(["center", "editorial", "split", "stack", "airy"]).optional(),
    gap: z.number().min(0).max(120).optional(),
    customHeight: z.number().min(320).max(2400).optional(),
  }).optional(),
  responsiveConfig: responsiveConfigSchema.optional(),
  animationConfig: animationConfigSchema.optional(),
  backgroundGenerationRequest: imageGenerationInputSchema.optional(),
  blocks: z.array(allowedBlockConfigSchema).max(40),
});

export const pagePatchSchema = z.object({
  page: allowedPageConfigSchema.partial().omit({ blocks: true, backgroundGenerationRequest: true }).optional(),
  blocksToAdd: z.array(allowedBlockConfigSchema).max(20).optional(),
  blocksToUpdate: z.array(z.object({ blockId: z.string().cuid(), patch: allowedBlockConfigSchema.partial() })).max(40).optional(),
  blockIdsToRemove: z.array(z.string().cuid()).max(40).optional(),
});

export const createPageSchema = z.object({
  pageType: z.enum(PAGE_TYPES),
  name: safeText(100).optional(),
});

export const reorderPagesSchema = z.object({ pageIds: z.array(z.string().cuid()).min(1).max(80) });

export const savePageSchema = z.object({
  name: safeText(100).optional(),
  pageType: z.enum(PAGE_TYPES).optional(),
  heightMode: z.enum(HEIGHT_MODES).optional(),
  backgroundConfig: backgroundConfigSchema.optional(),
  layoutConfig: allowedPageConfigSchema.shape.layoutConfig.optional(),
  responsiveConfig: responsiveConfigSchema.optional(),
  animationConfig: animationConfigSchema.optional(),
  isVisible: z.boolean().optional(),
  blocks: z.array(z.object({
    id: z.string().cuid().optional(),
    blockType: z.enum(BLOCK_TYPES),
    content: blockContentSchema,
    dataBinding: allowedBlockConfigSchema.shape.dataBinding.nullable().optional(),
    positionConfig: positionConfigSchema,
    styleConfig: styleConfigSchema,
    responsiveConfig: responsiveConfigSchema,
    animationConfig: animationConfigSchema,
    order: z.number().int().min(0).max(1000),
    isVisible: z.boolean(),
  })).max(80).optional(),
  versionLabel: safeText(120).optional(),
});

export const generatePageRequestSchema = z.object({
  prompt: safeText(1500, 12),
  pageId: z.string().cuid().optional(),
  mode: z.enum(["create", "edit"]).default("create"),
});
