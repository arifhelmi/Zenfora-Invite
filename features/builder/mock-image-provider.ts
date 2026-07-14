import crypto from "node:crypto";
import type { ImageEditInput, ImageGenerationInput, ImageGenerationProvider, ImageGenerationResult } from "@/features/builder/types";

const dimensions = {
  "9:16": [1080, 1920],
  "4:5": [1080, 1350],
  "1:1": [1080, 1080],
  "16:9": [1920, 1080],
} as const;

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;" })[char] ?? char);
}

function makeSvg(input: ImageGenerationInput, variant: number) {
  const [width, height] = dimensions[input.aspectRatio];
  const hash = crypto.createHash("sha256").update(`${input.prompt}:${variant}`).digest("hex");
  const colors = input.dominantColors?.length
    ? input.dominantColors
    : [`#${hash.slice(0, 6)}`, `#${hash.slice(6, 12)}`, `#${hash.slice(12, 18)}`];
  const safeX = input.safeArea?.horizontal === "left" ? 72 : input.safeArea?.horizontal === "right" ? width - 72 : width / 2;
  const safeY = input.safeArea?.vertical === "top" ? 120 : input.safeArea?.vertical === "bottom" ? height - 120 : height / 2;
  const circles = Array.from({ length: 9 }, (_, index) => {
    const x = Number.parseInt(hash.slice(index * 2, index * 2 + 2), 16) / 255 * width;
    const y = Number.parseInt(hash.slice(20 + index * 2, 22 + index * 2), 16) / 255 * height;
    const radius = Math.max(width, height) * (0.06 + (index % 4) * 0.035);
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${radius.toFixed(0)}" fill="${colors[index % colors.length]}" opacity="${(0.1 + (index % 3) * 0.06).toFixed(2)}"/>`;
  }).join("");
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".52" stop-color="${colors[1] ?? colors[0]}"/><stop offset="1" stop-color="${colors[2] ?? colors[0]}"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="38"/></filter><pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(${variant * 11})"><path d="M0 40H80M40 0V80" stroke="white" stroke-opacity=".07" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/> <g filter="url(#blur)">${circles}</g><rect width="100%" height="100%" fill="url(#p)"/><ellipse cx="${safeX}" cy="${safeY}" rx="${width * 0.28}" ry="${height * 0.18}" fill="white" opacity=".08"/><path d="M${width * 0.08} ${height * 0.86} Q ${width * 0.5} ${height * (0.72 + variant * 0.02)} ${width * 0.92} ${height * 0.86}" fill="none" stroke="white" stroke-opacity=".28" stroke-width="3"/><desc>${escapeXml(input.prompt)}</desc></svg>`,
    width,
    height,
  };
}

export class MockImageGenerationProvider implements ImageGenerationProvider {
  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    const images = Array.from({ length: input.numberOfResults }, (_, index) => {
      const generated = makeSvg(input, index + 1);
      return {
        bytes: new TextEncoder().encode(generated.svg),
        mimeType: "image/svg+xml" as const,
        width: generated.width,
        height: generated.height,
        filename: `mock-${input.purpose}-${crypto.randomUUID()}.svg`,
        providerMetadata: { mock: true, variant: index + 1, stylePreset: input.stylePreset ?? "editorial" },
      };
    });
    return { provider: "mock", images, license: "Zenvora development mock asset" };
  }

  async edit(input: ImageEditInput): Promise<ImageGenerationResult> {
    return this.generate({ ...input, prompt: `${input.prompt} (edited composition)` });
  }
}

export function getImageGenerationProvider(): ImageGenerationProvider {
  const provider = process.env.AI_IMAGE_PROVIDER ?? "mock";
  if (provider === "mock") return new MockImageGenerationProvider();
  throw new Error(`Provider gambar AI '${provider}' belum memiliki adapter.`);
}
