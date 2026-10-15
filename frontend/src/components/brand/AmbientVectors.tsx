export const AmbientVectors = () => {
  return (
    <>
      {/* Ambient Geometric Accent 1: Upper-Left Connected Node Diagram */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-12 hidden h-96 w-96 opacity-80 z-0 sm:block animate-nexus-float-h"
      >
        <svg className="h-full w-full" fill="none" viewBox="0 0 380 380">
          <defs>
            <linearGradient
              id="lineGrad1"
              x1="40"
              y1="60"
              x2="320"
              y2="280"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#315fe9" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#315fe9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#747686" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {/* Structural coordinate axis */}
          <line
            x1="40"
            y1="180"
            x2="340"
            y2="180"
            stroke="#c4c5d7"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1="180"
            y1="40"
            x2="180"
            y2="340"
            stroke="#c4c5d7"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          {/* Node connection network */}
          <polyline
            points="70,120 180,90 260,190 140,250 70,120"
            fill="none"
            stroke="url(#lineGrad1)"
            strokeWidth="1.25"
          />
          <line
            x1="180"
            y1="90"
            x2="140"
            y2="250"
            stroke="#315fe9"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <line
            x1="260"
            y1="190"
            x2="330"
            y2="150"
            stroke="#315fe9"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          {/* Node points */}
          <circle
            cx="70"
            cy="120"
            r="3.5"
            fill="var(--color-surface, #faf8ff)"
            stroke="#315fe9"
            strokeWidth="1.5"
          />
          <circle cx="180" cy="90" r="4.5" fill="#315fe9" />
          <circle
            cx="260"
            cy="190"
            r="3"
            fill="var(--color-surface, #faf8ff)"
            stroke="#315fe9"
            strokeWidth="1.5"
          />
          <circle
            cx="140"
            cy="250"
            r="3.5"
            fill="var(--color-surface, #faf8ff)"
            stroke="#747686"
            strokeWidth="1.5"
          />
          <circle cx="330" cy="150" r="2.5" fill="#315fe9" strokeOpacity="0.6" />
          {/* Numeric annotations */}
          <text
            x="188"
            y="85"
            fill="#434655"
            opacity="0.6"
            className="font-code-sm text-[10px]"
          >
            N-01
          </text>
          <text
            x="268"
            y="195"
            fill="#434655"
            opacity="0.6"
            className="font-code-sm text-[10px]"
          >
            N-04
          </text>
        </svg>
      </div>

      {/* Ambient Geometric Accent 2: Upper-Right Architectural Lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-8 -right-8 hidden h-80 w-80 opacity-75 z-0 md:block animate-nexus-float-v"
      >
        <svg className="h-full w-full" fill="none" viewBox="0 0 320 320">
          <rect
            x="60"
            y="50"
            width="180"
            height="130"
            rx="8"
            stroke="#c4c5d7"
            strokeOpacity="0.8"
            strokeWidth="1"
          />
          <rect
            x="90"
            y="80"
            width="180"
            height="130"
            rx="8"
            stroke="#315fe9"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <line
            x1="60"
            y1="50"
            x2="90"
            y2="80"
            stroke="#315fe9"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          <line
            x1="240"
            y1="180"
            x2="270"
            y2="210"
            stroke="#315fe9"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          <circle cx="90" cy="80" r="2" fill="#315fe9" />
          <circle cx="240" cy="180" r="2" fill="#315fe9" />
          <line
            x1="90"
            y1="40"
            x2="160"
            y2="40"
            stroke="#747686"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <line
            x1="90"
            y1="37"
            x2="90"
            y2="43"
            stroke="#747686"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <line
            x1="160"
            y1="37"
            x2="160"
            y2="43"
            stroke="#747686"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Ambient Geometric Accent 3: Lower-Right Concentric Orbit */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 right-6 hidden h-88 w-88 opacity-70 z-0 sm:block animate-nexus-float-h-reverse"
      >
        <svg className="h-full w-full" fill="none" viewBox="0 0 340 340">
          <circle
            cx="170"
            cy="170"
            r="110"
            stroke="#c4c5d7"
            strokeDasharray="4 6"
            strokeOpacity="0.7"
            strokeWidth="1"
          />
          <circle
            cx="170"
            cy="170"
            r="64"
            stroke="#315fe9"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <circle cx="170" cy="170" r="2" fill="#434655" />
          <line
            x1="170"
            y1="170"
            x2="250"
            y2="90"
            stroke="#315fe9"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <circle
            cx="250"
            cy="90"
            r="4"
            fill="var(--color-surface, #faf8ff)"
            stroke="#315fe9"
            strokeWidth="1.5"
          />
          <line
            x1="170"
            y1="170"
            x2="105"
            y2="235"
            stroke="#747686"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <circle cx="105" cy="235" r="3" fill="#c4c5d7" />
        </svg>
      </div>

      {/* Ambient Geometric Accent 4: Lower-Left Axis Node Balance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-10 hidden h-48 w-64 opacity-60 z-0 lg:block animate-nexus-float-v-reverse"
      >
        <svg className="h-full w-full" fill="none" viewBox="0 0 240 160">
          <line
            x1="20"
            y1="80"
            x2="200"
            y2="80"
            stroke="#c4c5d7"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <line
            x1="80"
            y1="40"
            x2="80"
            y2="120"
            stroke="#c4c5d7"
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <circle
            cx="80"
            cy="80"
            r="3"
            fill="var(--color-surface, #faf8ff)"
            stroke="#315fe9"
            strokeWidth="1.5"
          />
          <circle cx="160" cy="80" r="2" fill="#315fe9" strokeOpacity="0.8" />
          <line
            x1="80"
            y1="80"
            x2="160"
            y2="30"
            stroke="#315fe9"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <circle
            cx="160"
            cy="30"
            r="2.5"
            fill="var(--color-surface, #faf8ff)"
            stroke="#315fe9"
            strokeWidth="1"
          />
        </svg>
      </div>
    </>
  );
};

export default AmbientVectors;
