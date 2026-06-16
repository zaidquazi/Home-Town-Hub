import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';
import LocationPicker, { LocationData } from '@/components/ui/LocationPicker';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (locationStr: string) => void;
}

export default function LocationModal({ isOpen, onClose, onSelect }: LocationModalProps) {
  const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-neutral-950 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-auto relative"
        >
          <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 rounded-t-3xl bg-white dark:bg-neutral-950">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Add Location</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">
            <LocationPicker 
              value={selectedLoc || undefined}
              onChange={(loc) => setSelectedLoc(loc)}
              placeholder="Search for a city or place..."
            />
          </div>
          <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-900/30 rounded-b-3xl">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              disabled={!selectedLoc?.city}
              onClick={() => {
                if (selectedLoc) {
                  const locString = [selectedLoc.city, selectedLoc.state, selectedLoc.country].filter(Boolean).join(', ');
                  onSelect(locString);
                  onClose();
                }
              }}
            >
              Add to Post
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
