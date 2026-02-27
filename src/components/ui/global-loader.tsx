"use client";

import { useEffect, useState } from "react";

export function GlobalLoader() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // The CSS animation fades out after ~4.4s total.
        // We unmount it completely after 4.5s to free up DOM.
        const timer = setTimeout(() => {
            setShow(false);
        }, 4500);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        if (sessionStorage.getItem('nouryx_loader_played')) {
                            document.documentElement.classList.add('hide-global-loader');
                        } else {
                            sessionStorage.setItem('nouryx_loader_played', 'true');
                        }
                    `
                }}
            />
            <div id="nouryx-global-loader" className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden animate-loader-fade-out pointer-events-none">
                <style>{`
        /* Instantly hide loader if returning user in same session */
        .hide-global-loader #nouryx-global-loader {
            display: none !important;
            animation: none !important;
        }

        .logo-svg {
          width: 320px;
          overflow: visible;
          animation: logoReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          transform: translateY(12px);
        }

        @keyframes logoReveal {
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-text {
          font-size: 72px;
          font-family: var(--font-heading), 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: -1px;
          fill: none;
          stroke: #C9AA8B;
          stroke-width: 0.5;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawStroke 1.4s ease forwards 0.2s;
        }

        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }

        .logo-text-fill {
          font-size: 72px;
          font-family: var(--font-heading), 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: -1px;
          fill: #C9AA8B;
          opacity: 0;
          animation: fillFade 0.6s ease forwards 1.5s;
        }

        @keyframes fillFade {
          to { opacity: 1; }
        }

        .shimmer-rect {
          fill: url(#shimmerGrad);
          opacity: 0;
          animation: shimmerAnim 1s ease forwards 1.8s;
        }

        @keyframes shimmerAnim {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ─── THIN GOLD LINE ─── */
        .line-wrap {
          margin-top: 18px;
          width: 280px;
          height: 1px;
          background: transparent;
          position: relative;
          overflow: hidden;
        }

        .line-inner {
          position: absolute;
          top: 0; left: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, transparent, #C9AA8B, transparent);
          transform: translateX(-100%);
          animation: lineSlide 1.2s ease forwards 1.6s;
        }

        @keyframes lineSlide {
          to { transform: translateX(100%); }
        }

        .line-wrap::after {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          height: 1px;
          width: 0;
          background: #8c7250;
          animation: lineExpand 0.6s ease forwards 2.4s;
        }

        @keyframes lineExpand {
          to { width: 100%; }
        }

        /* ─── PROGRESS BAR ─── */
        .progress-wrap {
          margin-top: 28px;
          width: 180px;
          height: 2px;
          background: rgba(201,170,139,0.15);
          border-radius: 2px;
          overflow: hidden;
          opacity: 0;
          animation: fillFade 0.3s ease forwards 0.5s;
        }

        .progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #8c7250, #E8D5C0);
          border-radius: 2px;
          animation: progressFill 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.5s;
        }

        @keyframes progressFill {
          0%   { width: 0%; }
          40%  { width: 45%; }
          70%  { width: 72%; }
          90%  { width: 88%; }
          100% { width: 100%; }
        }

        /* ─── TAGLINE ─── */
        .tagline {
          margin-top: 14px;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #8c7250;
          opacity: 0;
          animation: fillFade 0.6s ease forwards 2.2s;
        }

        /* ─── DOTS ─── */
        .dots {
          display: flex;
          gap: 6px;
          margin-top: 10px;
          justify-content: center;
          opacity: 0;
          animation: fillFade 0.3s ease forwards 2.5s;
        }

        .dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #C9AA8B;
          animation: dotPulse 0.9s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }

        @keyframes overlayFadeOut {
          to { opacity: 0; pointer-events: none; visibility: hidden; }
        }
        .animate-loader-fade-out {
          animation: overlayFadeOut 0.6s ease forwards 3.8s;
        }
      `}</style>

                <div className="logo-wrap relative flex items-center justify-center">
                    <svg className="logo-svg" viewBox="0 0 340 90" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            {/* Shimmer gradient */}
                            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="45%" stopColor="rgba(255,230,170,0.55)" />
                                <stop offset="55%" stopColor="rgba(255,230,170,0.55)" />
                                <stop offset="100%" stopColor="transparent" />
                                <animateTransform
                                    attributeName="gradientTransform"
                                    type="translate"
                                    from="-1 0"
                                    to="2 0"
                                    dur="1s"
                                    begin="1.8s"
                                    fill="freeze"
                                />
                            </linearGradient>

                            {/* Gold gradient for fill */}
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#E8D5C0" />
                                <stop offset="100%" stopColor="#8c7250" />
                            </linearGradient>

                            <clipPath id="textClip">
                                <text
                                    x="170"
                                    y="72"
                                    textAnchor="middle"
                                    className="font-heading"
                                    fontSize="72"
                                    fontWeight="300"
                                    letterSpacing="-1"
                                >
                                    nouryx
                                </text>
                            </clipPath>
                        </defs>

                        {/* Stroke draw animation */}
                        <text className="logo-text" x="170" y="72" textAnchor="middle">
                            nouryx
                        </text>

                        {/* Fill fade in */}
                        <text className="logo-text-fill" x="170" y="72" fill="url(#goldGrad)" textAnchor="middle">
                            nouryx
                        </text>

                        {/* Shimmer sweep */}
                        <rect
                            className="shimmer-rect"
                            x="0"
                            y="0"
                            width="340"
                            height="90"
                            clipPath="url(#textClip)"
                        />
                    </svg>
                </div>

                {/* Divider line */}
                <div className="line-wrap">
                    <div className="line-inner"></div>
                </div>

                {/* Tagline */}
                <div className="tagline">Loading your experience</div>

                {/* Pulsing dots */}
                <div className="dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>

                {/* Progress bar */}
                <div className="progress-wrap">
                    <div className="progress-bar"></div>
                </div>
            </div>
        </>
    );
}
