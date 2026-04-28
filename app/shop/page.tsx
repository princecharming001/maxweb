"use client";

import Link from "next/link";
import { useEffect } from "react";

declare global {
  interface Window {
    ShopifyBuy?: any;
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
                "max-width": "520px",
                margin: "0 auto",
                "text-align": "center",
              },
              img: {
                display: "block",
                margin: "0 auto 26px auto",
                "border-radius": "28px",
              },
              title: {
                "font-size": "30px",
                "font-weight": "600",
                "margin-bottom": "10px",
              },
              price: {
                "font-size": "18px",
                "margin-bottom": "24px",
              },
              button: {
                "background-color": "#111111",
                color: "#ffffff",
                "border-radius": "999px",
                "padding": "16px",
                width: "100%",
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
    <main className="min-h-screen bg-[#f7f8f6] px-5 pb-24 pt-32 text-[#111]">
      
      {/* CENTERED NAVBAR */}
      <nav className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          
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

      <section className="mx-auto max-w-5xl">
        <section className="mb-14 text-center">
          <p className="mb-5 text-xs uppercase tracking-[0.24em] text-[#8a8d89]">
            Max Store
          </p>

          <h1 className="text-6xl font-semibold tracking-[-0.07em] md:text-7xl">
            Build your best self.
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg text-[#5f635f]">
            Premium essentials made for your daily Max routine.
          </p>
        </section>

        <section className="rounded-[38px] border border-black/5 bg-white p-6 shadow-[0_28px_90px_rgba(0,0,0,0.05)] md:p-10">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#9a9d99]">
              Featured Drop
            </p>

            <h2 className="text-4xl font-semibold md:text-5xl">
              OG Long Sleeve
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base text-[#686c68]">
              A clean everyday piece from the Max store.
            </p>
          </div>

          <div className="mx-auto flex max-w-[720px] justify-center rounded-[34px] border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.04)] md:p-10">
            <div id={PRODUCT_NODE_ID} className="flex w-full justify-center" />
          </div>

          <div className="mx-auto mt-12 max-w-2xl text-left">
            <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#9a9d99]">
              Details
            </p>

            <h3 className="mb-5 text-4xl font-semibold">
              Max your everyday fit.
            </h3>

            <p className="text-lg text-[#616561]">
              Designed with a minimal front graphic and a relaxed everyday feel.
              Easy to layer, easy to wear, and clean enough for any fit.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}