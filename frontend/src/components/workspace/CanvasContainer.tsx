import { memo } from "react";

import type { CollaborationState } from "../../collaboration/useCollaboration";
import Whiteboard from "../whiteboard/Whiteboard";

interface CanvasContainerProps {
  collabState: CollaborationState | null;
}

const CanvasContainer = ({ collabState }: CanvasContainerProps) => {
  return (
    <div
      className="relative min-h-0 flex-1 bg-surface overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(var(--color-outline-variant, #c4c5d7) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0",
      }}
    >
      {/* Corner bracket accents denoting viewport container bounds */}
      <div
        aria-hidden="true"
        className="absolute top-6 left-6 w-3 h-3 border-t-2 border-l-2 border-outline-variant/60 pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        className="absolute top-6 right-6 w-3 h-3 border-t-2 border-r-2 border-outline-variant/60 pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-6 w-3 h-3 border-b-2 border-l-2 border-outline-variant/60 pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-6 right-6 w-3 h-3 border-b-2 border-r-2 border-outline-variant/60 pointer-events-none z-10"
      />

      {/* Embedded Live Whiteboard */}
      <div className="absolute inset-0">
        <Whiteboard collabState={collabState} />
      </div>
    </div>
  );
};

export default memo(CanvasContainer);
