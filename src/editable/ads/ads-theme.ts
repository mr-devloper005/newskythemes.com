import type { AdSkin } from '@/lib/ads/ad-frame'

export const adSkin: AdSkin = {
  radius: '4px',
  border: '1px solid #e4e0d9',
  shadow: '0 1px 2px rgba(27,25,23,0.04)',
  background: '#ffffff',
  labelClassName: 'bg-[#c54a0d] text-white',
}

export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '4px', shadow: 'none', border: '1px solid #e4e0d9' },
  popup: { radius: '4px' },
  header: { radius: '4px', background: '#f5f1eb' },
  rail: { radius: '4px' },
  feature: { radius: '4px' },
  interstitial: { radius: '4px', shadow: '0 20px 60px rgba(27,25,23,0.3)' },
  anchor: { radius: '4px', shadow: '0 6px 24px rgba(27,25,23,0.12)' },
}

export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
