'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Link as LinkIcon, Camera } from 'lucide-react';
import { Button, Input, LocationPicker } from '@/components/ui';
import { useUpdateProfile } from '@/lib/hooks/useUser';
import { uploadToCloudinary } from '@/lib/upload';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { mutateAsync: updateProfile } = useUpdateProfile();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    bio: user.bio || '',
    occupation: user.occupation || '',
    education: user.education || '',
  });

  const [interestsStr, setInterestsStr] = useState(user.interests?.join(', ') || '');
  
  const [socialLinks, setSocialLinks] = useState({
    twitter: user.socialLinks?.twitter || '',
    linkedin: user.socialLinks?.linkedin || '',
    instagram: user.socialLinks?.instagram || '',
    github: user.socialLinks?.github || '',
    website: user.socialLinks?.website || '',
  });

  const [currentLocation, setCurrentLocation] = useState(user.currentLocation);
  const [hometown, setHometown] = useState(user.hometown);

  const [profilePic, setProfilePic] = useState<string | null>(user.profilePicture || null);
  const [coverPic, setCoverPic] = useState<string | null>(user.coverPhoto || null);
  
  const profileFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const [profileUploadLoading, setProfileUploadLoading] = useState(false);
  const [coverUploadLoading, setCoverUploadLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'profile') setProfileUploadLoading(true);
    else setCoverUploadLoading(true);

    try {
      const url = await uploadToCloudinary(file);
      if (type === 'profile') setProfilePic(url);
      else setCoverPic(url);
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed. Ensure Cloudinary is configured.');
    } finally {
      if (type === 'profile') setProfileUploadLoading(false);
      else setCoverUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const interestsArray = interestsStr.split(',').map(s => s.trim()).filter(Boolean);

      await updateProfile({
        ...formData,
        interests: interestsArray,
        socialLinks,
        currentLocation,
        hometown,
        profilePicture: profilePic || undefined,
        coverPhoto: coverPic || undefined,
      });

      toast.success('Profile updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
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
          className="bg-white dark:bg-neutral-950 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Edit Profile</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Cover Photo */}
              <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 group">
                {coverPic ? (
                  <img src={coverPic} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary-500/20 to-accent-500/20" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => coverFileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-medium transition-colors">
                    {coverUploadLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    Change Cover
                  </button>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={coverFileRef} onChange={(e) => handleImageUpload(e, 'cover')} />
              </div>

              {/* Profile Photo */}
              <div className="relative -mt-16 ml-6 w-28 h-28">
                <div className="w-full h-full rounded-full border-4 border-white dark:border-neutral-950 overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative group">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold text-3xl">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => profileFileRef.current?.click()}>
                    {profileUploadLoading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={profileFileRef} onChange={(e) => handleImageUpload(e, 'profile')} />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                <Input label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-body-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none h-24"
                  placeholder="Tell the community a little about yourself..."
                />
              </div>

              {/* Work & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Occupation" placeholder="e.g. Software Engineer at Google" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                <Input label="Education" placeholder="e.g. MIT Class of 2020" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} />
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Current City</label>
                  <LocationPicker
                    placeholder="Where are you currently living?"
                    value={currentLocation}
                    onChange={(loc: any) => setCurrentLocation(loc)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Hometown</label>
                  <LocationPicker
                    placeholder="Where are you originally from?"
                    value={hometown}
                    onChange={(loc: any) => setHometown(loc)}
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <Input label="Interests (comma separated)" placeholder="e.g. Photography, Hiking, Coding" value={interestsStr} onChange={e => setInterestsStr(e.target.value)} />
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input leftIcon={<LinkIcon className="w-4 h-4 text-neutral-400" />} placeholder="Twitter URL" value={socialLinks.twitter} onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })} />
                  <Input leftIcon={<LinkIcon className="w-4 h-4 text-neutral-400" />} placeholder="LinkedIn URL" value={socialLinks.linkedin} onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} />
                  <Input leftIcon={<LinkIcon className="w-4 h-4 text-neutral-400" />} placeholder="Instagram URL" value={socialLinks.instagram} onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })} />
                  <Input leftIcon={<LinkIcon className="w-4 h-4 text-neutral-400" />} placeholder="GitHub URL" value={socialLinks.github} onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })} />
                </div>
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 shrink-0 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-950/50">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" form="edit-profile-form" disabled={isLoading || profileUploadLoading || coverUploadLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
