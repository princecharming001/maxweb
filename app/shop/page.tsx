"use client";

import Link from "next/link";
import { useEffect } from "react";

type ShopifyClient = unknown;

interface ShopifyUI {
  createComponent: (
    component: "product",
    config: {
      id: string;
      node: HTMLElement;
      moneyFormat: string;
      options: Record<string, unknown>;
    },
  ) => void;
}

interface ShopifyBuyGlobal {
  UI?: {
    onReady: (client: ShopifyClient) => Promise<ShopifyUI>;
  };
  buildClient: (config: {
    domain: string;
    storefrontAccessToken: string;
  }) => ShopifyClient;
}

declare global {
  interface Window {
    ShopifyBuy?: ShopifyBuyGlobal;
  }
}

const SHOPIFY_SCRIPT =
  "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";

const PRODUCT_NODE_ID = "product-component-1777153394999";

export default function ShopPage() {
  useEffect(() => {
    let cancelled = false;

    function loadShopifyScript() {
      return new Promise<void>((resolve) => {
        if (window.ShopifyBuy?.UI) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          `script[src="${SHOPIFY_SCRIPT}"]`
        ) as HTMLScriptElement | null;

        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.async = true;
        script.src = SHOPIFY_SCRIPT;
        script.addEventListener("load", () => resolve(), { once: true });
        document.body.appendChild(script);
      });
    }

    async function ShopifyBuyInit() {
      await loadShopifyScript();

      if (cancelled) return;

      const productNode = document.getElementById(PRODUCT_NODE_ID);
      if (!productNode || !window.ShopifyBuy?.UI) return;

      productNode.innerHTML = "";

      const client = window.ShopifyBuy.buildClient({
        domain: "vjxudc-uq.myshopify.com",
        storefrontAccessToken: "0ab45ee50dcb1bd6451b70db521ba805",
      });

      const ui = await window.ShopifyBuy.UI.onReady(client);

      if (cancelled) return;

      productNode.innerHTML = "";

      ui.createComponent("product", {
        id: "15032991482226",
        node: productNode,
        moneyFormat: "%24%7B%7Bamount%7D%7D",
        options: {
          product: {
            layout: "vertical",
            contents: {
              img: true,
              title: true,
              price: true,
              button: true,
              quantity: false,
            },
            styles: {
              product: {
                width: "100%",
                "max-width": "100%",
                margin: "0",
                "text-align": "left",
              },
              img: {
                display: "block",
                margin: "0 0 20px 0",
                "border-radius": "20px",
              },
              title: {
                "font-size": "22px",
                "font-weight": "600",
                "margin-bottom": "8px",
                "letter-spacing": "-0.02em",
              },
              price: {
                "font-size": "16px",
                "margin-bottom": "16px",
                "letter-spacing": "-0.01em",
              },
              button: {
                "background-color": "#111111",
                color: "#ffffff",
                "border-radius": "999px",
                "padding": "14px",
                width: "100%",
                "font-size": "13px",
                "letter-spacing": "0.02em",
              },
            },
          },
        },
      });
    }

    ShopifyBuyInit();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7f5] px-5 pb-24 pt-32 text-[#111]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-28 h-52 w-52 rounded-full bg-white/80 blur-3xl animate-soft-float" />
        <div className="absolute right-[-12%] top-60 h-60 w-60 rounded-full bg-black/[0.03] blur-3xl animate-soft-float-delayed" />
      </div>

      <nav className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl animate-fade-in">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#555] hover:bg-[#f2f2f2]"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Shop
          </Link>

        </div>
      </nav>

      <section className="relative mx-auto max-w-5xl">
        <section className="mb-6 rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-xl animate-fade-in-up sm:p-7">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#8d908d]">
              Max Shop
            </p>
            <p className="text-[12px] text-[#7f847f] sm:text-right">Edition 01</p>
          </div>

          <h1 className="mt-6 text-[clamp(2.1rem,11vw,4.8rem)] font-semibold tracking-[-0.075em] leading-[0.9]">
            fashionmax
          </h1>

          <p className="mt-5 max-w-sm text-[14px] leading-relaxed tracking-[-0.01em] text-[#676b67]">
            merch designed to make you ascend
          </p>
        </section>

        <section className="grid gap-4 animate-fade-in-up md:grid-cols-[120px_1fr]">
          <aside className="hidden md:flex rounded-3xl border border-black/5 bg-white/70 px-4 py-6 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="[writing-mode:vertical-rl] rotate-180 text-[11px] uppercase tracking-[0.28em] text-[#8f928f]">
              Current Drop
            </div>
          </aside>

          <section className="rounded-[28px] border border-black/5 bg-white/85 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="shop-section-title">Products</h2>
              <p className="text-[12px] tracking-[-0.01em] text-[#7f847f]">1 item</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5">
                <div id={PRODUCT_NODE_ID} className="w-full" />
              </article>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}