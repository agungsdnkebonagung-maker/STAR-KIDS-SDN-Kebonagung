import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 48,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200"
      >
        <defs>
          {/* Path for Arched Text: DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA PASURUAN */}
          <path
            id="textArcPath"
            d="M 68,235 A 190,190 0 0,1 432,235"
            fill="none"
          />
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Main Outer Pentagon Shield */}
        {/* Points: Top (250, 25), Top-Right (475, 175), Bottom-Right (385, 470), Bottom-Left (115, 470), Top-Left (25, 175) */}
        <polygon
          points="250,25 475,175 385,470 115,470 25,175"
          fill="#FFFFFF"
          stroke="#111827"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Red accent ribbon polygon on left side of shield */}
        <path
          d="M 25,175 L 140,250 L 105,420 L 115,470 L 25,175 Z"
          fill="#DC2626"
          opacity="0.95"
        />

        {/* 2. Globe Circle in Background */}
        <circle
          cx="250"
          cy="260"
          r="150"
          fill="#53B7EA"
          stroke="#1F2937"
          strokeWidth="6"
        />

        {/* Stylized Continents on Globe (Asia/Indonesia region) */}
        <path
          d="M 140,200 Q 180,180 200,210 Q 220,190 270,195 Q 310,180 340,220 Q 320,270 290,270 Q 270,310 230,330 Q 180,310 160,260 Z"
          fill="#16A34A"
        />
        <path
          d="M 180,335 Q 230,320 270,345 Q 310,340 350,320 Q 380,350 360,370 Q 300,390 220,380 Z"
          fill="#15803D"
        />
        {/* Indonesian Archipelago islands */}
        <ellipse cx="260" cy="340" rx="35" ry="8" fill="#15803D" />
        <ellipse cx="320" cy="335" rx="25" ry="7" fill="#16A34A" />
        <ellipse cx="205" cy="325" rx="20" ry="6" fill="#16A34A" />

        {/* 3. Arched Text: DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA PASURUAN */}
        <text
          fill="#111827"
          fontSize="22"
          fontWeight="800"
          letterSpacing="0.8"
          style={{ fontFamily: 'Georgia, serif, sans-serif' }}
        >
          <textPath
            href="#textArcPath"
            startOffset="50%"
            textAnchor="middle"
          >
            DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA PASURUAN
          </textPath>
        </text>

        {/* 4. Center Monument / Tugu Pahlawan Pasuruan */}
        {/* White Obelisk Body */}
        <path
          d="M 235,150 L 265,150 L 273,340 L 227,340 Z"
          fill="#FFFFFF"
          stroke="#111827"
          strokeWidth="6"
        />
        {/* Tugu Rounded Dome Cap */}
        <path
          d="M 235,150 C 235,130 265,130 265,150 Z"
          fill="#FFFFFF"
          stroke="#DC2626"
          strokeWidth="6"
        />
        {/* Vertical Red Stripe in Center of Tugu */}
        <rect
          x="245"
          y="155"
          width="10"
          height="170"
          fill="#DC2626"
          rx="3"
        />

        {/* 5. Base Pedestal with Stylized Red Wing/Kujang Ornaments */}
        {/* Horizontal Pedestal */}
        <rect
          x="200"
          y="335"
          width="100"
          height="20"
          fill="#DC2626"
          stroke="#111827"
          strokeWidth="4"
          rx="3"
        />
        <rect
          x="205"
          y="348"
          width="90"
          height="12"
          fill="#FFFFFF"
          stroke="#111827"
          strokeWidth="3"
        />

        {/* Left Wing Ornament */}
        <path
          d="M 215,315 C 215,290 195,305 180,340 C 160,350 145,360 160,375 C 185,375 205,355 215,340 Z"
          fill="#B91C1C"
          stroke="#111827"
          strokeWidth="5"
        />
        {/* Right Wing Ornament */}
        <path
          d="M 285,315 C 285,290 305,305 320,340 C 340,350 355,360 340,375 C 315,375 295,355 285,340 Z"
          fill="#B91C1C"
          stroke="#111827"
          strokeWidth="5"
        />

        {/* 6. Open Book (Buku Terbuka Simbol Pendidikan) */}
        {/* Book Left Page */}
        <path
          d="M 248,365 L 140,430 L 150,445 L 248,385 Z"
          fill="#E5E7EB"
          stroke="#111827"
          strokeWidth="5"
        />
        {/* Book Right Page */}
        <path
          d="M 252,365 L 360,430 L 350,445 L 252,385 Z"
          fill="#F3F4F6"
          stroke="#111827"
          strokeWidth="5"
        />
        {/* Book Spine Center Line */}
        <line
          x1="250"
          y1="365"
          x2="250"
          y2="445"
          stroke="#111827"
          strokeWidth="6"
        />
        {/* Book Base / Cover Thick Edge */}
        <path
          d="M 140,435 L 140,448 L 250,455 L 360,448 L 360,435 L 350,445 L 250,448 L 150,445 Z"
          fill="#1F2937"
        />

        {/* 7. Bottom Text: UPT SDN KEBONAGUNG */}
        <rect
          x="110"
          y="485"
          width="280"
          height="55"
          fill="#FFFFFF"
          rx="6"
        />
        <text
          x="250"
          y="522"
          textAnchor="middle"
          fill="#111827"
          fontSize="36"
          fontWeight="900"
          letterSpacing="1"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          UPT SDN KEBONAGUNG
        </text>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
            KOTA PASURUAN
          </span>
          <span className="text-base font-extrabold text-slate-900 leading-tight">
            SDN Kebonagung
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            TPPK &bull; Disiplin & Apresiasi Karakter
          </span>
        </div>
      )}
    </div>
  );
};
