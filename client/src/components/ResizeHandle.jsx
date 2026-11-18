import { useEffect } from "react";

export default function ResizeHandle({
  onResize,
  minWidth = 200,
  maxWidth = 400,
}) {
  useEffect(() => {
    let startX, startWidth;

    const handleMouseDown = (e) => {
      startX = e.clientX;
      startWidth = e.target.parentElement.offsetWidth;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      const width = startWidth + (e.clientX - startX);
      if (width >= minWidth && width <= maxWidth) {
        onResize(`${width}px`);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const resizeHandle = document.createElement("div");
    resizeHandle.className =
      "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-700 hover:bg-gray-600";
    resizeHandle.addEventListener("mousedown", handleMouseDown);
    e.target.appendChild(resizeHandle);

    return () => {
      resizeHandle.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize, minWidth, maxWidth]);

  return null;
}
