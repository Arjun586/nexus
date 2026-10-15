import NexusMark from "./brand/NexusMark";

interface AuthLoadingProps {
  headline?: string;
  subtext?: string;
}

export const AuthLoading = ({
  headline = "Restoring your session…",
  subtext = "Preparing your workspace",
}: AuthLoadingProps) => {
  return (
    <main className="w-screen h-screen h-[100dvh] max-h-screen overflow-hidden bg-surface flex items-center justify-center p-4 selection:bg-primary selection:text-on-primary">
      <div className="flex flex-col w-full h-full relative items-center justify-center overflow-hidden select-none">
        {/* LAYER 1: SKELETON REHYDRATION PREVIEW (Faint architectural ghost layout ~7% opacity) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex flex-col opacity-[0.07] transition-opacity duration-1000 overflow-hidden"
        >
          {/* Faint Top Shell Header Bar */}
          <div className="w-full h-14 bg-on-surface flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-sm bg-on-surface-variant" />
              <div className="w-24 h-2.5 rounded-full bg-on-surface-variant" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-2.5 rounded-full bg-on-surface-variant" />
              <div className="w-7 h-7 rounded-full bg-on-surface-variant" />
            </div>
          </div>
          {/* Faint Workspace Frame */}
          <div className="flex-1 flex w-full min-h-0 overflow-hidden">
            {/* Faint Left Navigation Rail */}
            <div className="w-60 h-full bg-on-surface flex flex-col p-6 gap-5 shrink-0">
              <div className="w-32 h-3 rounded-full bg-surface" />
              <div className="w-24 h-2.5 rounded-full bg-surface opacity-75" />
              <div className="w-28 h-2.5 rounded-full bg-surface opacity-60" />
              <div className="w-20 h-2.5 rounded-full bg-surface opacity-50" />
              <div className="mt-8 w-16 h-2 rounded-full bg-surface opacity-40" />
              <div className="w-36 h-2.5 rounded-full bg-surface opacity-50" />
              <div className="w-24 h-2.5 rounded-full bg-surface opacity-50" />
            </div>
            {/* Faint Canvas Structural Areas */}
            <div className="flex-1 p-10 flex flex-col gap-8 min-h-0 overflow-hidden">
              <div className="w-72 h-6 rounded-md bg-on-surface opacity-60 shrink-0" />
              <div className="grid grid-cols-12 gap-8 w-full flex-1 min-h-0">
                <div className="col-span-8 rounded-xl bg-on-surface opacity-40 min-h-0 h-full" />
                <div className="col-span-4 rounded-xl bg-on-surface opacity-30 min-h-0 h-full" />
                <div className="col-span-12 rounded-xl bg-on-surface opacity-25 min-h-0 h-24" />
              </div>
            </div>
          </div>
        </div>

        {/* LAYER 2: GEOMETRIC IDENTITY COMPOSITIONS (Engineered peripheral accents) */}
        {/* Top Left: Precision Node Topology Vector */}
        <div
          aria-hidden="true"
          className="absolute top-12 left-14 pointer-events-none opacity-25"
        >
          <svg
            className="text-secondary"
            fill="none"
            height="60"
            viewBox="0 0 80 60"
            width="80"
          >
            <circle cx="12" cy="14" r="3" fill="#2563eb" />
            <circle cx="68" cy="46" r="2.5" fill="currentColor" opacity="0.6" />
            <line
              stroke="currentColor"
              strokeDasharray="2 2"
              strokeWidth="0.75"
              x1="12"
              x2="68"
              y1="14"
              y2="46"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Bottom Right: Geometric Balance Assembly */}
        <div
          aria-hidden="true"
          className="absolute bottom-12 right-16 pointer-events-none opacity-25 flex flex-col items-end"
        >
          <svg
            className="text-secondary"
            fill="none"
            height="70"
            viewBox="0 0 70 70"
            width="70"
          >
            <circle
              cx="35"
              cy="35"
              r="28"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="0.75"
            />
            <rect
              height="36"
              rx="2"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="0.75"
              width="36"
              x="30"
              y="20"
            />
            <circle cx="35" cy="35" fill="#2563eb" r="2" />
          </svg>
        </div>

        {/* LAYER 3: CENTRAL RESTORATION PANEL */}
        <div className="relative z-10 w-full max-w-[440px] bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg shadow-on-surface/5 p-10 flex flex-col items-center text-center">
          <div className="relative w-12 h-12 flex items-center justify-center mb-6">
            <NexusMark size={36} />
          </div>

          <div className="flex items-center gap-2 mb-5">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tighter lowercase">
              nexus
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="font-label-meta text-[10px] uppercase tracking-wider text-secondary">
              workspace
            </span>
          </div>

          <h1 className="font-display-editorial text-[28px] leading-[36px] text-on-surface tracking-tight font-normal mb-3">
            {headline}
          </h1>
          <p className="font-body-md text-body-md text-secondary font-normal tracking-normal mb-8">
            {subtext}
          </p>

          <div className="w-[180px] h-[2px] bg-surface-container rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-12 bg-primary-container rounded-full animate-[nexus-glider-slide_2s_ease-in-out_infinite]"
              id="nexus-glider"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthLoading;
