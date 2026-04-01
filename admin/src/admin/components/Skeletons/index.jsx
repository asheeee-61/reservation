// Reusable skeleton components
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes skeleton-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function SkeletonBase({ 
  width    = '100%', 
  height   = 16, 
  radius   = 4,
  style    = {} 
}) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background:   '#E0E0E0',
      animation:    'skeleton-pulse 1.5s ease-in-out infinite',
      flexShrink:   0,
      ...style,
    }} />
  )
}

// Table row skeleton
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #F1F3F4' }}>
      {Array(cols).fill(0).map((_, i) => (
        <div key={i} style={{ flex: 1, padding: '14px 16px' }}>
          <SkeletonBase 
            height={14} 
            width={i === 0 ? '40%' : '70%'} 
          />
        </div>
      ))}
    </div>
  )
}

// Service row skeleton
export function ServiceRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F1F3F4' }}>
      <SkeletonBase width={40} height={16} style={{ marginRight: 16 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonBase width="40%" height={14} />
        <SkeletonBase width="25%" height={12} />
      </div>
      <SkeletonBase width={100} height={28} radius={4} />
    </div>
  )
}

// Table skeleton (full)
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {Array(rows).fill(0).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ lines = 3 }) {
  return (
    <div style={{
      background:   'white',
      border:       '1px solid #E0E0E0',
      borderRadius: 4,
      padding:      24,
    }}>
      <SkeletonBase height={18} width="40%" />
      <div style={{ marginTop: 16, display: 'flex', 
                    flexDirection: 'column', gap: 8 }}>
        {Array(lines).fill(0).map((_, i) => (
          <SkeletonBase 
            key={i} 
            height={13} 
            width={i === lines - 1 ? '60%' : '100%'} 
          />
        ))}
      </div>
    </div>
  )
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div style={{
      background:   'white',
      border:       '1px solid #E0E0E0',
      borderRadius: 4,
      padding:      20,
      flex:         1,
    }}>
      <SkeletonBase height={12} width="50%" />
      <SkeletonBase 
        height={28} width="40%" 
        style={{ marginTop: 12 }} 
      />
      <SkeletonBase 
        height={11} width="70%" 
        style={{ marginTop: 8 }} 
      />
    </div>
  )
}

// Avatar skeleton
export function AvatarSkeleton({ size = 36 }) {
  return (
    <SkeletonBase 
      width={size} 
      height={size} 
      radius="50%" 
    />
  )
}

// Form field skeleton
export function FieldSkeleton() {
  return (
    <div>
      <SkeletonBase height={11} width="30%" />
      <SkeletonBase 
        height={56} 
        style={{ marginTop: 6 }} 
      />
    </div>
  )
}

// Page header skeleton
export function PageHeaderSkeleton() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    }}>
      <SkeletonBase height={24} width={200} />
      <SkeletonBase height={36} width={140} radius={4} />
    </div>
  )
}
