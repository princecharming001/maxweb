"use client";

import { useEffect } from "react";

export default function ShopPage() {
  useEffect(() => {
    const scriptURL =
      "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";

    function ShopifyBuyInit() {
      const client = (window as any).ShopifyBuy.buildClient({
        domain: "vjxudc-uq.myshopify.com",
        storefrontAccessToken: "0ab45ee50dcb1bd6451b70db521ba805",
      });

      (window as any).ShopifyBuy.UI.onReady(client).then((ui: any) => {
        ui.createComponent("product", {
          id: "15032991482226",
          node: document.getElementById("product-component-1777153394999"),
          moneyFormat: "%24%7B%7Bamount%7D%7D",
          options: {
            product: {
              styles: {
                product: {
                  "@media (min-width: 601px)": {
                    "max-width": "360px",
                    "margin-left": "0px",
                    "margin-bottom": "50px",
                  },
                },
                button: {
                  "background-color": "#272927",
                  ":hover": { "background-color": "#424642" },
                  ":focus": { "background-color": "#424642" },
                  "border-radius": "0px",
                  "padding-left": "80px",
                  "padding-right": "80px",
                },
              },
              text: {
                button: "Add to cart",
              },
            },
            cart: {
              styles: {
                button: {
                  "background-color": "#272927",
                  ":hover": { "background-color": "#424642" },
                  ":focus": { "background-color": "#424642" },
                  "border-radius": "0px",
                },
              },
              text: {
                total: "Subtotal",
                button: "Checkout",
              },
            },
            toggle: {
              styles: {
                toggle: {
                  "background-color": "#272927",
                  ":hover": { "background-color": "#424642" },
                  ":focus": { "background-color": "#424642" },
                },
              },
            },
          },
        });
      });
    }

    if ((window as any).ShopifyBuy?.UI) {
      ShopifyBuyInit();
    } else {
      const script = document.createElement("script");
      script.async = true;
      script.src = scriptURL;
      document.body.appendChild(script);
      script.onload = ShopifyBuyInit;
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "140px 24px 80px",
      }}
    >
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "12px",
              fontWeight: 600,
              letterSpacing: "-1px",
            }}
          >
            Shop
          </h1>

          <p
            style={{
              color: "#666",
              fontSize: "18px",
            }}
          >
            Upgrade your max routine.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
        >
          <div id="product-component-1777153394999"></div>
        </div>
      </section>
    </main>
  );
}