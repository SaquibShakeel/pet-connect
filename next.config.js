/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'media.istockphoto.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'images.pexels.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com', // For Google OAuth profile pictures
    ],
  },
}

module.exports = nextConfig 