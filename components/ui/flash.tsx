"use client";
import { useEffect, useState } from "react";
export function Flash({ message }: { message?: string }) { const [visible, setVisible] = useState(Boolean(message)); useEffect(() => { if (message) { const id = setTimeout(() => setVisible(false), 5000); return () => clearTimeout(id); } }, [message]); return visible ? <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null; }
