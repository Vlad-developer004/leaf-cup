"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type FlightDetail = {
  imageUrl: string;
  rect: { left: number; top: number; width: number; height: number };
};

type Flight = FlightDetail & {
  id: number;
  dx: number;
  dy: number;
};

const THUMB_SIZE = 72;
let nextId = 0;

export function dispatchFlyToCart(imageUrl: string, sourceEl: Element) {
  const rect = sourceEl.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent<FlightDetail>("fly-to-cart", {
      detail: {
        imageUrl,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      },
    })
  );
}

export function FlyToCartLayer() {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    function handleFly(e: Event) {
      const { imageUrl, rect } = (e as CustomEvent<FlightDetail>).detail;
      const target = document.getElementById("cart-icon");
      if (!target) return;

      const targetRect = target.getBoundingClientRect();
      const startCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const endCenter = {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
      };

      const id = nextId++;
      setFlights((prev) => [
        ...prev,
        {
          id,
          imageUrl,
          rect,
          dx: endCenter.x - startCenter.x,
          dy: endCenter.y - startCenter.y,
        },
      ]);

      setTimeout(() => {
        setFlights((prev) => prev.filter((f) => f.id !== id));
      }, 750);
    }

    window.addEventListener("fly-to-cart", handleFly);
    return () => window.removeEventListener("fly-to-cart", handleFly);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-100">
      <AnimatePresence>
        {flights.map((flight) => (
          <motion.div
            key={flight.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: [0, flight.dx * 0.4, flight.dx],
              y: [0, flight.dy * 0.55 - 60, flight.dy],
              scale: [1, 0.9, 0.2],
              opacity: [1, 1, 0.6],
            }}
            transition={{ duration: 0.7, ease: [0.32, 0, 0.67, 0] }}
            style={{
              position: "fixed",
              left: flight.rect.left + flight.rect.width / 2 - THUMB_SIZE / 2,
              top: flight.rect.top + flight.rect.height / 2 - THUMB_SIZE / 2,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
            }}
            className="overflow-hidden rounded-xl shadow-lg ring-2 ring-primary/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flight.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
