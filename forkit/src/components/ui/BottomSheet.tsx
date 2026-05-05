import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ──────────────────────────────────────────────
   BottomSheet — slide-up panel with backdrop
   Drag handle · Tap-backdrop-to-close · Framer Motion
   ────────────────────────────────────────────── */

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /** Optional title rendered as a header below the drag handle */
  title?: string
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="bottom-sheet__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* ── Sheet ── */}
          <motion.div
            className="bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_e, info) => {
              // Close if dragged down more than 100px
              if (info.offset.y > 100) onClose()
            }}
          >
            {/* Drag handle */}
            <div className="bottom-sheet__handle-area">
              <div className="bottom-sheet__handle" />
            </div>

            {/* Optional title */}
            {title && <h3 className="bottom-sheet__title">{title}</h3>}

            {/* Content */}
            <div className="bottom-sheet__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
