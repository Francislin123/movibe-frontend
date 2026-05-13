import type { EventUserResponse } from '../types'

interface EventUserCardProps {
  eventUser: EventUserResponse
  onCheckIn?: (userId: string) => void
  onCancelCheckIn?: (userId: string) => void
  isCheckedIn?: boolean
  isLoading?: boolean
}

// User status badge component
function UserStatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 border-purple-400/50 shadow-lg ring-1 ring-purple-500/20 backdrop-blur-sm'
      case 'INACTIVE':
        return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold bg-gray-800/50 text-gray-400 border-gray-700/50 shadow-sm'
      case 'SUSPENDED':
        return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold bg-red-900/50 text-red-400 border-red-800/50 shadow-sm'
      default:
        return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold bg-gray-800/50 text-gray-400 border-gray-700/50 shadow-sm'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'INACTIVE':
        return 'Inativo'
      case 'SUSPENDED':
        return 'Suspenso'
      default:
        return status
    }
  }

  return (
    <span className={getStatusStyle(status)}>
      {status === 'ACTIVE' ? (
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-white/50 animate-ping" />
        </div>
      ) : (
        <div className={`w-2 h-2 rounded-full ${
          status === 'INACTIVE' ? 'bg-gray-500' : 
          'bg-red-500'
        }`} />
      )}
      {getStatusText(status)}
    </span>
  )
}

// Check-in button component
function CheckInButton({ 
  isCheckedIn, 
  isLoading, 
  onCheckIn, 
  onCancelCheckIn 
}: { 
  isCheckedIn: boolean
  isLoading: boolean
  onCheckIn: () => void
  onCancelCheckIn: () => void
}) {
  const handleClick = () => {
    if (isLoading) return
    
    if (isCheckedIn) {
      onCancelCheckIn()
    } else {
      onCheckIn()
    }
  }

  const title = isCheckedIn ? "Cancelar check-in" : "Realizar check-in"
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={title}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        isLoading 
          ? 'bg-gray-700 cursor-not-allowed shadow-inner' 
          : isCheckedIn
            ? 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 cursor-pointer shadow-lg ring-2 ring-emerald-500/30 backdrop-blur-sm'
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 cursor-pointer shadow-lg ring-2 ring-purple-500/30 backdrop-blur-sm'
      }`}
    >
      {isLoading ? (
        <svg className="w-4.5 h-4.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : isCheckedIn ? (
        <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </button>
  )
}

export default function EventUserCard({ 
  eventUser, 
  onCheckIn, 
  onCancelCheckIn, 
  isCheckedIn = false, 
  isLoading = false 
}: EventUserCardProps) {
  const { user } = eventUser

  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-surfaceBorder/40 hover:border-blue-500/30 transition-all duration-150"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {user.image ? (
          <img 
            src={user.image} 
            alt={user.displayName} 
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-500/20" 
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-textPrimary truncate">{user.displayName}</p>
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <UserStatusBadge status={user.status} />
      </div>

      {/* Check-in Button */}
      <div className="shrink-0">
        <CheckInButton
          isCheckedIn={isCheckedIn}
          isLoading={isLoading}
          onCheckIn={() => onCheckIn?.(user.id)}
          onCancelCheckIn={() => onCancelCheckIn?.(user.id)}
        />
      </div>
    </div>
  )
}
