# Link Click

Link Click is a beautifully designed, modern full-stack social media application. Built with a focus on immersive UI, rich micro-interactions, and premium aesthetics, Link Click allows users to seamlessly share content, connect with others, and discover new communities.

## ✨ Key Features

- **Immersive UI/UX**: Built with a custom "Lightbox" design system utilizing warm amber accents, glassmorphism, and incredibly smooth micro-animations.
- **Dynamic Interactions**: Double-tap images to like them with a beautiful bursting heart animation.
- **Link System (Followers)**: Build your network by "Linking" with other users. Track who you are linked with on your profile.
- **Rich Media**: Upload high-quality post images and custom profile avatars (powered by ImageKit). View images in a dedicated full-screen lightbox.
- **Robust Profiles**: View a user's original posts or browse the content they've liked via sleek profile tabs.
- **Secure Authentication**: End-to-end security using JWT tokens, HTTP-only best practices, and Bcrypt password hashing.
- **Founder Platform & Dashboard**: Single-founder operational platform featuring metrics overview, user governance, audit logs, and account immutability safeguards.

## 🛠️ Technology Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS v4
- React Router DOM v6
- Axios
- Lucide React (Iconography)
- React Hot Toast

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- ImageKit & Multer (File Storage & Uploads)
- Bcrypt.js

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- ImageKit account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UdayShankarPandey/pep-project.git
   cd pep-project
   ```

2. **Backend Setup**
   ```bash
   # Install dependencies
   npm install

   # Copy example environment variables
   cp .env.example .env

   # Configure .env variables:
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   FOUNDER_EMAIL=udayshankarpandey.03@gmail.com

   # Run founder seed check (optional)
   node scripts/seed-founder.js

   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   # Open a new terminal and navigate to the client folder
   cd client

   # Install dependencies
   npm install

   # Start the Vite development server
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

## 📱 Mobile Responsiveness

The entire application—from the intricate post feeds and image lightboxes, all the way to complex administrative data tables—has been meticulously engineered to be 100% responsive. Whether you are using a 4K desktop monitor or an iPhone SE, the layout perfectly adapts to provide a native-feeling experience.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the MIT License.
