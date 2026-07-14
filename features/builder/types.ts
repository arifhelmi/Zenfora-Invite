export const PAGE_TYPES = [
  "blank", "cover", "greeting", "quote", "profile", "couple", "event-schedule",
  "location", "countdown", "story", "gallery", "video", "dress-code", "rundown",
  "rsvp", "wishes", "gift", "qr-guest", "closing", "custom",
] as const;

export const BLOCK_TYPES = [
  "heading", "text", "image", "generated-image", "decorative-image", "button",
  "open-invitation-button", "countdown", "person-profile", "couple-profile", "event-card",
  "maps-button", "calendar-button", "gallery", "video", "story-timeline", "rsvp-form",
  "wishes-list", "wishes-form", "gift-method", "bank-account", "qr-code", "divider",
  "music-controller", "social-link", "spacer", "container",
] as const;

export const HEIGHT_MODES = ["viewport", "minimum-viewport", "auto", "custom"] as const;
export const ASPECT_RATIOS = ["9:16", "4:5", "1:1", "16:9"] as const;
export const ASSET_PURPOSES = ["background", "decoration", "frame", "divider", "pattern", "illustration"] as const;

export type PageType = typeof PAGE_TYPES[number];
export type BlockType = typeof BLOCK_TYPES[number];
export type HeightMode = typeof HEIGHT_MODES[number];
export type AspectRatio = typeof ASPECT_RATIOS[number];
export type AssetPurpose = typeof ASSET_PURPOSES[number];
export type BuilderViewport = "mobile" | "tablet" | "desktop";

export type BackgroundConfig = {
  assetId?: string;
  url?: string;
  size: "cover" | "contain" | "auto";
  positionX: number;
  positionY: number;
  overlayColor?: string;
  overlayOpacity?: number;
  blur?: number;
  color?: string;
};

export type BlockContent = {
  text?: string;
  label?: string;
  url?: string;
  alt?: string;
  items?: string[];
};

export type PositionConfig = {
  layoutPreset?: string;
  alignment?: "left" | "center" | "right" | "stretch";
  x?: number;
  y?: number;
  width?: number;
  maxWidth?: number;
};

export type StyleConfig = {
  stylePreset?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: "display" | "body" | "serif";
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  padding?: number;
  opacity?: number;
};

export type ResponsiveConfig = {
  hiddenOn?: BuilderViewport[];
  mobile?: Partial<PositionConfig & StyleConfig>;
  tablet?: Partial<PositionConfig & StyleConfig>;
  desktop?: Partial<PositionConfig & StyleConfig>;
};

export type AnimationConfig = {
  preset?: "none" | "fade" | "rise" | "scale" | "slide-left" | "slide-right";
  duration?: number;
  delay?: number;
};

export type BuilderBlock = {
  id: string;
  pageId: string;
  blockType: BlockType;
  content: BlockContent;
  dataBinding?: string | null;
  positionConfig: PositionConfig;
  styleConfig: StyleConfig;
  responsiveConfig: ResponsiveConfig;
  animationConfig: AnimationConfig;
  order: number;
  isVisible: boolean;
};

export type BuilderAsset = {
  id: string;
  pageId: string;
  name: string;
  purpose: AssetPurpose;
  metadata: Record<string, unknown>;
  mediaAsset?: { id: string; url: string; width?: number | null; height?: number | null } | null;
};

export type BuilderPage = {
  id: string;
  invitationId: string;
  name: string;
  slug: string;
  pageType: PageType;
  order: number;
  heightMode: HeightMode;
  backgroundConfig: BackgroundConfig;
  layoutConfig: Record<string, unknown>;
  responsiveConfig: ResponsiveConfig;
  animationConfig: AnimationConfig;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  blocks: BuilderBlock[];
  assets: BuilderAsset[];
};

export type BuilderDocument = {
  id: string;
  eventId: string;
  scrollSnapEnabled: boolean;
  pages: BuilderPage[];
};

export type ImageGenerationInput = {
  prompt: string;
  negativePrompt?: string;
  purpose: AssetPurpose;
  aspectRatio: AspectRatio;
  stylePreset?: string;
  dominantColors?: string[];
  safeArea?: {
    horizontal: "left" | "center" | "right";
    vertical: "top" | "center" | "bottom";
  };
  numberOfResults: number;
};

export type ImageEditInput = ImageGenerationInput & { sourceAssetUrl: string };

export type GeneratedImage = {
  bytes: Uint8Array;
  mimeType: "image/svg+xml" | "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
  filename: string;
  providerMetadata: Record<string, unknown>;
};

export type ImageGenerationResult = {
  provider: string;
  images: GeneratedImage[];
  license: string;
};

export interface ImageGenerationProvider {
  generate(input: ImageGenerationInput): Promise<ImageGenerationResult>;
  edit(input: ImageEditInput): Promise<ImageGenerationResult>;
}

export type AllowedBlockConfig = {
  type: BlockType;
  content?: BlockContent;
  dataBinding?: string;
  layoutPreset?: string;
  stylePreset?: string;
  positionConfig?: PositionConfig;
  styleConfig?: StyleConfig;
  responsiveConfig?: ResponsiveConfig;
  animationConfig?: AnimationConfig;
};

export type AllowedPageConfig = {
  name?: string;
  pageType: PageType;
  heightMode: HeightMode;
  backgroundConfig?: Partial<BackgroundConfig>;
  layoutConfig?: Record<string, unknown>;
  responsiveConfig?: ResponsiveConfig;
  animationConfig?: AnimationConfig;
  backgroundGenerationRequest?: ImageGenerationInput;
  blocks: AllowedBlockConfig[];
};

export type PagePatch = {
  page?: Partial<AllowedPageConfig>;
  blocksToAdd?: AllowedBlockConfig[];
  blocksToUpdate?: Array<{ blockId: string; patch: Partial<AllowedBlockConfig> }>;
  blockIdsToRemove?: string[];
};
