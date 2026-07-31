import { memo } from "react";

import type { CollaborationState } from "../../collaboration/useCollaboration";
import Whiteboard from "../whiteboard/Whiteboard";

interface CanvasContainerProps {
  collabState: CollaborationState | null;
}

const CanvasContainer = ({ collabState }: CanvasContainerProps) => {
  return (
    <div className="relative min-h-0 flex-1 bg-gray-50">
      <div className="absolute inset-0">
        <Whiteboard collabState={collabState} />
      </div>
    </div>
  );
};

export default memo(CanvasContainer);
