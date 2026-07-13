import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import crypto from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export interface StorageAdapter { put(file: File, ownerId: string): Promise<{ url: string; key: string }>; remove(key: string): Promise<void>; }
export class LocalStorageAdapter implements StorageAdapter {
  async put(file: File, ownerId: string) { const dir = join(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "uploads", ownerId); await mkdir(dir, { recursive: true }); const key = `${ownerId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`; await writeFile(join(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "uploads", key), Buffer.from(await file.arrayBuffer())); return { key, url: `/api/uploads/${key}` }; }
  async remove(key: string) { await unlink(join(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "uploads", key)).catch(() => undefined); }
}

export class S3CompatibleStorageAdapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;
  constructor() {
    if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) throw new Error("Konfigurasi S3 belum lengkap.");
    this.bucket = env.S3_BUCKET;
    this.client = new S3Client({ endpoint: env.S3_ENDPOINT, region: env.S3_REGION, forcePathStyle: true, credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY } });
  }
  async put(file: File, ownerId: string) { const key = `${ownerId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`; await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type })); const base = env.S3_PUBLIC_BASE_URL || `${env.S3_ENDPOINT}/${this.bucket}`; return { key, url: `${base.replace(/\/$/, "")}/${key}` }; }
  async remove(key: string) { await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key })); }
}
export const storage: StorageAdapter = env.STORAGE_DRIVER === "s3" ? new S3CompatibleStorageAdapter() : new LocalStorageAdapter();
