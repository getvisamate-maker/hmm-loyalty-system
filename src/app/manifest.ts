import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hmm Loyalty System',
    short_name: 'Hmm Loyalty',
    description: 'Digital loyalty cards for your favourite cafes',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
