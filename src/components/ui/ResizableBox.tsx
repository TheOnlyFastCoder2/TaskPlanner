import { PropsWithChildren, useRef, useEffect, useState } from "react";
import { GripVertical } from 'lucide-react';

interface IProps extends PropsWithChildren {
  className?: string;
}

export default function ResizableComponent({ children, className }: IProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [offset, setOffset] = useState(0);
  const refChildWidth = useRef<number>(0);

  const startResizing = (clientX: number) => {
    setIsResizing(true);
    if (refChildWidth.current === 0) {
      refChildWidth.current = boxRef.current?.children[1].clientWidth!;
    }
    setOffset(clientX - (boxRef.current?.getBoundingClientRect().right || 0));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startResizing(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    startResizing(e.touches[0].clientX);
  };

  const handleResize = (clientX: number) => {
    document.body.style.cursor = 'ew-resize';
    const newWidth = clientX - (boxRef.current?.getBoundingClientRect().left || 0) + offset;
    if (newWidth > refChildWidth.current) {
      setWidth(newWidth);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      handleResize(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isResizing) {
      e.stopPropagation();
      handleResize(e.touches[0].clientX);
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
  };

  const handleMouseUp = stopResizing;
  const handleTouchEnd = stopResizing;

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

  return (
    <div>
      <div ref={boxRef} style={{ minWidth: innerWidth > 1024 ? width : 0 }} className={`flex min-lg:border-r-2 relative pr-2 items-center min-size-full z-50 ${className || ''}`}>
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="lg:hidden absolute flex justify-center items-center select-none cursor-ew-resize rounded-md bg-slate-100 h-[30px] right-[-14px]"
        >
          <GripVertical className="stroke-slate-400" />
        </div>
        {children}
      </div>
    </div>
  );
}
