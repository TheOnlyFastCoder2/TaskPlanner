import { findDomElement } from '@/lib/utils';
import { useState, useRef, useEffect, PropsWithChildren, RefObject } from 'react';
import 'styles/components/DraggableBox.scss';

import { X } from 'lucide-react';
import { Button } from './button';

interface IProps extends PropsWithChildren {
  startCoords?: RefObject<{ x: number, y: number }>,
  parentIDorClassName?: string,
  toClose?: () => void,
}

export default function DraggableBox({ children, startCoords, parentIDorClassName, toClose }: IProps) {
  const refParent = useRef<HTMLElement>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0, newX: 0, newY: 0, scrollX: 0, scrollY: 0 });
  const draggableRef = useRef<HTMLDivElement>(null);

  const initializeOffset = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if(!draggableRef.current) return;

    if (parentIDorClassName) {
      if (!refParent.current) {
        refParent.current = findDomElement(draggableRef.current, parentIDorClassName);
      } if (refParent.current) {
        updateScrollOffsets();
      }
    }

    const rect = draggableRef.current.getBoundingClientRect();
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    offset.current.x = pageX - rect.left - offset.current.scrollX;
    offset.current.y = pageY - rect.top - offset.current.scrollY;
  };

  const updateScrollOffsets = () => {
    if (refParent.current) {
      offset.current.scrollY = refParent.current.scrollTop || 0;
      offset.current.scrollX = refParent.current.scrollLeft || 0;
    }
  };

  const setPosition = (newX: number, newY: number) => {
    if (draggableRef.current) {
      draggableRef.current.style.left = `${newX}px`;
      draggableRef.current.style.top = `${newY}px`;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
    initializeOffset(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = offset.current.newX = e.pageX - offset.current.x; 
      const newY = offset.current.newY = e.pageY - offset.current.y;
      setPosition(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (startCoords?.current) {
      startCoords.current.x = offset.current.newX;
      startCoords.current.y = offset.current.newY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.stopPropagation();
      const newX = offset.current.newX = e.touches[0].pageX - offset.current.x; 
      const newY = offset.current.newY = e.touches[0].pageY - offset.current.y;
      setPosition(newX, newY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (startCoords?.current) {
      startCoords.current.x = offset.current.newX;
      startCoords.current.y = offset.current.newY;
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setIsDragging(true);
      initializeOffset(e);
  };

  const initializeDraggablePosition = () => {
    if (draggableRef.current && parentIDorClassName) {
      refParent.current = findDomElement(draggableRef.current, parentIDorClassName);
      if (refParent.current) {
        updateScrollOffsets();
        offset.current.newX = (startCoords?.current.x || 0) + offset.current.scrollX;
        offset.current.newY = (startCoords?.current.y || 0) + offset.current.scrollY;
      }
      if(innerWidth >= 1024) {
        setPosition(offset.current.newX, offset.current.newY);
      }
    }
  };

  useEffect(() => {
    initializeDraggablePosition();
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, false);
    window.addEventListener("touchend", handleTouchEnd, false);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      window.addEventListener("touchmove", handleTouchMove, false);
      window.addEventListener("touchend", handleTouchEnd, false);
    };
  }, [isDragging]);

  return (
    <div
      ref={draggableRef}
      className="DraggableBox"
    >
      <div>
        <div onMouseDown={handleMouseDown} onTouchStart={innerWidth > 1024 ? handleTouchStart : undefined} id="topPanel" className={'DraggableBox__top-panel'}>
           { !!toClose && <Button variant={'destructive'} className='h-full rounded-none' onClick={toClose}><X/></Button>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
