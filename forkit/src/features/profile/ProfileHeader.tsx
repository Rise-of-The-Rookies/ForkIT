import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/userStore'
import BottomSheet from '@/components/ui/BottomSheet'
import type { UserProfile } from '@/types'

/* ──────────────────────────────────────────────
   ProfileHeader — avatar, name, bio, stats, edit
   ────────────────────────────────────────────── */

// Personality type → emoji map
const PERSONALITY_EMOJI: Record<string, string> = {
  adventurer: '🌶️',
  comfort_seeker: '🍜',
  social_foodie: '🎉',
  health_nut: '🥗',
  trendsetter: '✨',
  budget_hunter: '💰',
}

interface ProfileHeaderProps {
  user: UserProfile
  savedCount: number
  reviewCount: number
}

export default function ProfileHeader({
  user,
  savedCount,
  reviewCount,
}: ProfileHeaderProps) {
  const setUser = useUserStore((s) => s.setUser)
  const [editOpen, setEditOpen] = useState(false)

  // ── Edit form state ──
  const [editName, setEditName] = useState(user.display_name)
  const [editBio, setEditBio] = useState(user.bio ?? '')
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatar_url ?? '')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = user.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const personalityLabel = user.personality_type
    ? user.personality_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  const personalityEmoji =
    PERSONALITY_EMOJI[user.personality_type ?? ''] ?? '🍴'

  // ── Avatar upload ──
  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      console.error('[ProfileHeader] Avatar upload error:', uploadError.message)
      setUploadingAvatar(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    setEditAvatarUrl(publicUrl)
    setUploadingAvatar(false)
  }

  // ── Save profile edits ──
  const handleSave = async () => {
    if (!editName.trim()) return
    setSaving(true)

    const updates: Partial<UserProfile> = {
      display_name: editName.trim(),
      bio: editBio.trim() || null,
      avatar_url: editAvatarUrl || null,
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error('[ProfileHeader] Update error:', error.message)
      return
    }

    // Update global store
    setUser({ ...user, ...updates })
    setEditOpen(false)
  }

  const handleEditOpen = () => {
    setEditName(user.display_name)
    setEditBio(user.bio ?? '')
    setEditAvatarUrl(user.avatar_url ?? '')
    setEditOpen(true)
  }

  return (
    <>
      <div className="profile-header">
        {/* ── Avatar ── */}
        <div className="profile-header__avatar">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="profile-header__avatar-img"
            />
          ) : (
            <span className="profile-header__avatar-initials">{initials}</span>
          )}
        </div>

        {/* ── Name ── */}
        <h2 className="profile-header__name">{user.display_name}</h2>

        {/* ── Bio ── */}
        {user.bio && (
          <p className="profile-header__bio">{user.bio}</p>
        )}

        {/* ── Personality badge ── */}
        {personalityLabel && (
          <span className="profile-header__personality">
            {personalityEmoji} {personalityLabel}
          </span>
        )}

        {/* ── Stats row ── */}
        <div className="profile-header__stats">
          <div className="profile-header__stat">
            <span className="profile-header__stat-num">{savedCount}</span>
            <span className="profile-header__stat-label">Saved</span>
          </div>
          <div className="profile-header__stat-divider" />
          <div className="profile-header__stat">
            <span className="profile-header__stat-num">{reviewCount}</span>
            <span className="profile-header__stat-label">Reviews</span>
          </div>
        </div>

        {/* ── Edit button ── */}
        <motion.button
          className="profile-header__edit-btn"
          onClick={handleEditOpen}
          whileTap={{ scale: 0.96 }}
        >
          Edit Profile
        </motion.button>
      </div>

      {/* ═══════ Edit bottom sheet ═══════ */}
      <BottomSheet
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
      >
        <div className="profile-edit">
          {/* Avatar picker */}
          <div className="profile-edit__avatar-wrap" onClick={() => fileInputRef.current?.click()}>
            {editAvatarUrl ? (
              <img src={editAvatarUrl} alt="Avatar" className="profile-edit__avatar-img" />
            ) : (
              <span className="profile-edit__avatar-placeholder">📷</span>
            )}
            {uploadingAvatar && <div className="profile-edit__avatar-loading" />}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="profile-edit__file-input"
            />
          </div>

          {/* Display name */}
          <div className="profile-edit__field">
            <label className="profile-edit__label">Display Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="profile-edit__input"
              maxLength={40}
            />
          </div>

          {/* Bio */}
          <div className="profile-edit__field">
            <label className="profile-edit__label">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value.slice(0, 160))}
              className="profile-edit__textarea"
              rows={3}
              maxLength={160}
              placeholder="Tell the world about your food journey…"
            />
            <span className="profile-edit__char-count">{editBio.length}/160</span>
          </div>

          {/* Save */}
          <button
            className="profile-edit__save-btn"
            onClick={handleSave}
            disabled={saving || !editName.trim()}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
