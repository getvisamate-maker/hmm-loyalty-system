import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 192,
  height: 192,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 80,
          fontWeight: 800,
          borderRadius: 40,
        }}
      >
        HMM
      </div>
    ),
    { ...size }
  )
}
