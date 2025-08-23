import { useEffect, useRef } from 'react';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCursorsProps {
  stageRef: React.RefObject<any>;
  zoom: number;
  stagePos: { x: number; y: number };
}

export function LiveCursors({ stageRef, zoom, stagePos }: LiveCursorsProps) {
  const { collaborators } = useCollaborationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const getScreenPosition = (cursor: { x: number; y: number }) => {
    // Convert canvas coordinates to screen coordinates
    return {
      x: cursor.x * zoom + stagePos.x,
      y: cursor.y * zoom + stagePos.y
    };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {collaborators
          .filter(user => user.cursor)
          .map(user => {
            const screenPos = getScreenPosition(user.cursor!);
            
            return (
              <motion.div
                key={user.sessionId}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  left: screenPos.x,
                  top: screenPos.y,
                  pointerEvents: 'none',
                  zIndex: 9999,
                }}
              >
                {/* Cursor SVG */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  style={{ 
                    filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
                    transform: 'translate(-2px, -2px)'
                  }}
                >
                  <path
                    d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                    fill={user.color}
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
                
                {/* User name label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-6 top-1 px-2 py-1 text-xs font-medium text-white rounded-md shadow-lg max-w-32 truncate"
                  style={{ 
                    backgroundColor: user.color,
                    fontSize: '11px'
                  }}
                >
                  {user.name}
                </motion.div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </div>
  );
}