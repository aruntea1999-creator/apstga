import fs from "fs";
import path from "path";

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  badge: string | null;
  badgeColor: string;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceStore {
  products: MarketplaceProduct[];
}

function storePath() {
  return path.join(process.cwd(), "data", "marketplace-products.json");
}

function readStore(): MarketplaceStore {
  const raw = fs.readFileSync(storePath(), "utf-8");
  return JSON.parse(raw);
}

function writeStore(store: MarketplaceStore): void {
  fs.writeFileSync(storePath(), JSON.stringify(store, null, 2));
}

export function getProducts(): MarketplaceProduct[] {
  const store = readStore();
  return store.products;
}

export function getActiveProducts(): MarketplaceProduct[] {
  const store = readStore();
  return store.products.filter((p) => p.active);
}

export function getProduct(id: string): MarketplaceProduct | undefined {
  const store = readStore();
  return store.products.find((p) => p.id === id);
}

export function createProduct(
  data: Omit<MarketplaceProduct, "id" | "createdAt" | "updatedAt">
): MarketplaceProduct {
  const store = readStore();
  const now = new Date().toISOString();
  const product: MarketplaceProduct = {
    ...data,
    id: String(Date.now()),
    createdAt: now,
    updatedAt: now,
  };
  store.products.push(product);
  writeStore(store);
  return product;
}

export function updateProduct(
  id: string,
  data: Partial<Omit<MarketplaceProduct, "id" | "createdAt">>
): MarketplaceProduct | undefined {
  const store = readStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  store.products[idx] = {
    ...store.products[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store.products[idx];
}

export function deleteProduct(id: string): boolean {
  const store = readStore();
  const len = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  if (store.products.length === len) return false;
  writeStore(store);
  return true;
}