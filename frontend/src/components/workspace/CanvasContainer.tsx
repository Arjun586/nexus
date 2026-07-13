import Whiteboard from "../whiteboard/Whiteboard";

const CanvasContainer = () => {
  return (
    <div className="relative min-h-0 flex-1 bg-gray-50">
      <div className="absolute inset-0">
        <Whiteboard />
      </div>
    </div>
  );
};

export default CanvasContainer;
