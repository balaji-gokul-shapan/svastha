"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createLanyard } from "./lanyardPhysics.js";
import "./lanyard.css";
import Image from "next/image.js";

/* ==========================================================================
   STUDENT HEALTH ID CARD (lanyard badge)
   ==========================================================================
   The design is the one from components/healthCard, ported to real data:

     • every selector is scoped under `.hc-lanyard` (see lanyard.css) so the
       card can be dropped anywhere without touching the rest of the app
     • the slots below come from buildHealthCardData() (./card-data.js) — the
       defaults keep the component renderable on its own and document each slot
     • the demo QR/barcode were replaced: the back panel holds the student's
       photo, and the bar strip is derived from the student's ID so the same
       child always gets the same pattern
     • `HealthCardSheet` renders the same two faces flat — it is the target for
       the PDF export, because html2canvas cannot rasterise backface-visibility
       or a 3-D flipped card.
   ========================================================================== */

const DEFAULT_DATA = {
  brand: "Svastha",
  code: "ID SV-0000",
  event: ["Svastha Health Services", "Academic Year 2026-2027"],
  person: "Class --",
  field: "--",
  role: "Student",
  access: "STUDENT HEALTH CARD",
  site: "",
  seat: "",
  pill: "HEALTH SUMMARY",
  photo: "",
  domains: [],
  barcode: "SVAS",
};


function Barcode({ seed = "" }) {
  const bars = useMemo(() => {

    let h = 0;
    for (let i = 0; i < seed.length; i += 1) {
      h = (h * 31 + seed.charCodeAt(i)) % 2147483647;
    }

    let x = 0;
    const out = [];
    while (x < 200) {
      h = (h * 16807) % 2147483647;
      const width = 1 + Math.floor((h / 2147483647) * 3);
      h = (h * 16807) % 2147483647;
      if (h / 2147483647 > 0.4) out.push([x, width]);
      x += width + 1;
    }
    return out;
  }, [seed]);

  return (
    <svg
      className="barcode"
      viewBox="0 0 200 26"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {bars.map(([x, w], i) => (
        <rect key={i} x={x} y="0" width={w} height="26" fill="currentColor" />
      ))}
    </svg>
  );
}

function Front({ data }) {
  // Real names are longer than a demo pass, so the hero shrinks a step rather
  // than running off the card.
  const roleClass = data.role.length > 14 ? "role role--long" : "role";

  return (
    <section className="face front">
      <div className="top-row">
        <div className="flex flex-col">
          <Image
          src="/logo.svg"
          alt="Svastha Logo"
          width={25}
          height={25}
        />
        <span className="logo">{data.brand}</span>
        </div>
        <span className="code">{data.code}</span>
      </div>
      <div className="rule" />
      <div className="event">
        {data.event.map((line, index) =>
          index === 0 ? (
            <div key={line}>
              <b>{line}</b>
            </div>
          ) : (
            <div key={line}>{line}</div>
          ),
        )}
      </div>
      <div className="person">
        {data.person}
        {data.field ? <small>{data.field}</small> : null}
      </div>
      <div className={roleClass}>{data.role}</div>
      <div className="access">{data.access}</div>
      <div className="foot">
        <span>{data.site}</span>
        <strong>{data.seat}</strong>
      </div>
    </section>
  );
}

function Back({ data }) {
  return (
    <section className="face back">
      <div className="back-head">
        <span className="logo">{data.brand}</span>
        <span className="pill">{data.pill}</span>
      </div>

      <div className="photo-panel">
        {data.photo ? (
          // Remote blob URLs carry SAS query params; next/image would need them
          // configured for every host, so a plain img is used as in the report.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photo} alt="" />
        ) : (
          <span className="photo-empty">PASTE PHOTO HERE</span>
        )}
      </div>

      <div className="meta">
        {data.domains.map((domain) => (
          <div key={domain.key}>
            <span>{domain.label}</span>
            <span className="v" data-tone={domain.tone}>
              {domain.value}
            </span>
          </div>
        ))}
      </div>

      <Barcode seed={data.barcode} />
    </section>
  );
}

/**
 * FLAT FRONT + BACK SHEET
 * -----------------------
 * The export/print form of the card: both faces side by side with no 3-D
 * context, so html2canvas draws exactly what the DOM says. Mount it off-screen
 * (see health-check-modal.jsx), rasterise it, drop it in the PDF.
 */
export function HealthCardSheet({ data }) {
  const card = { ...DEFAULT_DATA, ...data };

  return (
    <div className="hc-lanyard">
      <div className="sheet-host">
        <div className="sheet">
          <figure>
            <div className="sheet-card">
              <Front data={card} />
            </div>
            <figcaption>Front</figcaption>
          </figure>
          <figure>
            <div className="sheet-card">
              <Back data={card} />
            </div>
            <figcaption>Back</figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}

export default function HealthIdCard({
  data,
  size = "default",
  stageClassName = "",
  onDownload,
  downloadLabel = "Download PDF",
}) {
  const [flipped, setFlipped] = useState(false);
  const swingRef = useRef(null);

  const physRef = useRef(null);
  const card = useMemo(() => ({ ...DEFAULT_DATA, ...data }), [data]);

  useEffect(() => {
    const phys = createLanyard({
      pivot: () => swingRef.current,
      onAngle: (angle) => {
        if (swingRef.current) {
          swingRef.current.style.transform = `rotate(${angle}deg)`;
        }
      },
    });
    physRef.current = phys;

    const t = setTimeout(() => phys.kick(5), 400); // intro swing
    return () => {
      clearTimeout(t);
      phys.stop();
      physRef.current = null;
    };
  }, []);

  const onDown = (event) => physRef.current?.down(event);
  const onMove = (event) => physRef.current?.move(event);
  const onUp = () => {
    // `up()` reports whether the gesture was a drag; a plain click flips.
    if (physRef.current && !physRef.current.up()) setFlipped((f) => !f);
  };

  return (
    <div
      className={[
        "hc-lanyard",
        "lanyard-stage",
        size === "compact" ? "hc-lanyard--compact" : "",
        stageClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* <div className="lanyard-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3l14 8-6 2-2 6z" />
        </svg>
        Click &amp; Drag to Toss
      </div> */}

      <div className="lanyard" ref={swingRef}>
        <div className="strap" />
        <svg className="hardware" viewBox="0 0 60 130" aria-hidden="true">
          <defs>
            <linearGradient id="hc-lanyard-blk" x1="0" x2="1">
              <stop offset="0" stopColor="#050505" />
              <stop offset=".45" stopColor="#2b2b2f" />
              <stop offset="1" stopColor="#050505" />
            </linearGradient>
          </defs>
          {/* D-ring */}
          <path
            d="M11 8 H49 V26 Q49 46 30 46 Q11 46 11 26 Z"
            fill="none"
            stroke="#050505"
            strokeWidth="5.5"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 10.5 H46.5 V26 Q46.5 43.5 30 43.5"
            fill="none"
            stroke="#3a3a3f"
            strokeWidth="1"
            opacity=".8"
          />
          {/* swivel */}
          <rect x="25" y="44" width="10" height="15" rx="3.5" fill="url(#hc-lanyard-blk)" stroke="#000" />
          <circle cx="30" cy="64" r="5.5" fill="none" stroke="#050505" strokeWidth="4" />
          {/* claw */}
          <path
            d="M23 68 C20 92 22 108 30 122 C37 108 40 92 37 68 Z"
            fill="url(#hc-lanyard-blk)"
            stroke="#000"
            strokeWidth="1.5"
          />
          <path
            d="M27 74 C26 92 27 104 30 112"
            fill="none"
            stroke="#4a4a50"
            strokeWidth="1"
            opacity=".7"
          />
          {/* loop through the badge slot */}
          <ellipse cx="30" cy="116" rx="10" ry="8" fill="none" stroke="#050505" strokeWidth="4.5" />
          <ellipse cx="30" cy="114" rx="8" ry="6" fill="none" stroke="#3a3a3f" strokeWidth=".8" opacity=".8" />
        </svg>

        <div
          className={`badge ${flipped ? "is-flipped" : ""}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)
          }
          role="button"
          tabIndex={0}
          aria-label={`Health card for ${card.role}. Press to flip.`}
        >
          <div className="badge-inner">
            <Front data={card} />
            <Back data={card} />
          </div>
        </div>
      </div>

      <div className="lanyard-actions">
        <button
          type="button"
          className="lanyard-flip"
          onClick={() => setFlipped((f) => !f)}
        >
          Flip card
        </button>
        {onDownload ? (
          <button
            type="button"
            className="lanyard-flip lanyard-print"
            onClick={onDownload}
          >
            {downloadLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

