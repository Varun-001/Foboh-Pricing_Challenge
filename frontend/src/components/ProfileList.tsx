import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Tag } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { getProfiles, deleteProfile } from '../api/client'
import type { PricingProfile } from '../types'

interface Props {
  refreshTrigger: number
  onEdit: (profile: PricingProfile) => void
  onToast: (type: 'success' | 'error', message: string) => void
}

function adjustmentSummary(p: PricingProfile): string {
  const dir = p.direction === 'increase' ? '+' : '−'
  const val = p.adjustmentType === 'fixed'
    ? `$${p.adjustment.toFixed(2)}`
    : `${p.adjustment}%`
  return `${dir}${val} (${p.adjustmentType})`
}

export default function ProfileList({ refreshTrigger, onEdit, onToast }: Props) {
  const [profiles, setProfiles]       = useState<PricingProfile[]>([])
  const [loading, setLoading]         = useState(true)
  const [confirmId, setConfirmId]     = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    getProfiles()
      .then(setProfiles)
      .catch(() => onToast('error', 'Failed to load profiles'))
      .finally(() => setLoading(false))
  }, [onToast])

  useEffect(() => { load() }, [load, refreshTrigger])

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await deleteProfile(confirmId)
      onToast('success', 'Profile deleted')
      load()
    } catch {
      onToast('error', 'Failed to delete profile')
    } finally {
      setConfirmId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-4">Loading profiles…</p>
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
        <Tag size={24} className="mb-2 opacity-40" />
        <p className="text-sm font-medium">No profiles yet</p>
        <p className="text-xs mt-1">Create one above to get started</p>
      </div>
    )
  }

  const confirmProfile = profiles.find((p) => p.id === confirmId)

  return (
    <>
      <div className="space-y-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-5 py-4 hover:border-foboh-teal/40 transition-colors shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-foboh-teal-bg flex items-center justify-center flex-shrink-0">
              <Tag size={16} className="text-foboh-teal" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{profile.name}</p>
              {profile.description && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{profile.description}</p>
              )}
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{adjustmentSummary(profile)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile.productIds.length} product{profile.productIds.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(profile)}
                className="p-2 text-gray-400 hover:text-foboh-teal hover:bg-foboh-teal-bg rounded-lg transition-colors"
                title="Edit profile"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => setConfirmId(profile.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete profile"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmId && confirmProfile && (
        <ConfirmDialog
          title="Delete profile?"
          message={`"${confirmProfile.name}" will be permanently deleted and cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  )
}
