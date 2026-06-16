'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Calendar as CalendarIcon, MapPin, Clock, Users } from 'lucide-react';
import { Button, Input, LocationPicker } from '@/components/ui';
import { useCreateEvent } from '@/lib/hooks/useEvents';
import { useUserCommunities } from '@/lib/hooks/useUser';
import { useAuthStore } from '@/store';
import { uploadToCloudinary } from '@/lib/upload';
import toast from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const user = useAuthStore(s => s.user);
  const { data: communities } = useUserCommunities(user?.username || '');
  const { mutateAsync: createEvent } = useCreateEvent();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'General',
    community: '',
    maxAttendees: '',
  });

  const [coverPic, setCoverPic] = useState<string | null>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const [coverUploadLoading, setCoverUploadLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploadLoading(true);
    try {
      const url = await uploadToCloudinary(file);
      setCoverPic(url);
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed.');
    } finally {
      setCoverUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.venue || !formData.community) {
      return toast.error('Please fill in all required fields.');
    }

    setIsLoading(true);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      await createEvent({
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        venue: formData.venue,
        category: formData.category,
        community: formData.community,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        coverPhoto: coverPic || undefined,
      });

      toast.success('Event created successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-neutral-950 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Event</h2>
              <p className="text-sm text-neutral-500">Host an event in your community.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Cover Photo */}
              <div className="relative h-40 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 group border-2 border-dashed border-neutral-300 dark:border-neutral-800 flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors" onClick={() => coverFileRef.current?.click()}>
                {coverPic ? (
                  <img src={coverPic} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-neutral-500">
                    {coverUploadLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="font-medium">Upload Event Banner</span>
                      </>
                    )}
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" ref={coverFileRef} onChange={handleImageUpload} />
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <Input label="Event Title" placeholder="e.g. Summer BBQ in the Park" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-body-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none h-24"
                    placeholder="What is this event about?"
                    required
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input type="date" className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input type="time" className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                </div>
              </div>

              {/* Location & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input leftIcon={<MapPin className="w-5 h-5 text-neutral-400" />} label="Venue / Location" placeholder="e.g. Central Park" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} required />
                <Input type="number" leftIcon={<Users className="w-5 h-5 text-neutral-400" />} label="Capacity (Optional)" placeholder="Max attendees" value={formData.maxAttendees} onChange={e => setFormData({ ...formData, maxAttendees: e.target.value })} />
              </div>

              {/* Community & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Host Community</label>
                  <select 
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={formData.community}
                    onChange={e => setFormData({ ...formData, community: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a community</option>
                    {communities?.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
                  <select 
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="General">General</option>
                    <option value="Tech">Tech & Networking</option>
                    <option value="Food">Food & Drink</option>
                    <option value="Sports">Sports & Fitness</option>
                    <option value="Music">Music & Entertainment</option>
                    <option value="Workshop">Workshop & Education</option>
                  </select>
                </div>
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 shrink-0 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-950/50">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" form="create-event-form" disabled={isLoading || coverUploadLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Create Event
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
