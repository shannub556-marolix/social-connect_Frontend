# SocialConnect Frontend

A modern, responsive React frontend for the SocialConnect social media platform.

## 🚀 Features

- **Authentication System**
  - User registration with email verification
  - Login with username or email
  - Password reset functionality
  - Change password for authenticated users
  - JWT token-based authentication
  - Automatic token refresh

- **Responsive Design**
  - Mobile-first approach
  - Tailwind CSS for styling
  - Modern UI components
  - Beautiful gradients and animations

- **User Experience**
  - Form validation
  - Loading states
  - Error handling
  - Success messages
  - Protected routes

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Context API

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-connect_Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend Setup

Make sure your Django backend is running on `http://localhost:8000` before testing the frontend.

## 📁 Project Structure

```
src/
├── api/
│   ├── axiosInstance.ts    # Axios configuration with interceptors
│   └── authApi.ts         # Authentication API functions
├── components/
│   └── ui/
│       ├── Button.tsx     # Reusable button component
│       ├── Input.tsx      # Reusable input component
│       └── Card.tsx       # Reusable card component
├── contexts/
│   └── AuthContext.tsx    # Authentication context provider
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── EmailVerification.tsx
│   │   └── ChangePassword.tsx
│   └── Dashboard.tsx
├── types/
│   └── auth.ts           # TypeScript type definitions
├── App.tsx               # Main app component with routing
├── main.tsx             # Entry point
└── index.css            # Global styles and Tailwind imports
```

## 🔐 Authentication Flow

1. **Registration**: Users can register with username, email, and password
2. **Email Verification**: Users receive a verification email
3. **Login**: Users can login with username/email and password
4. **Token Management**: JWT tokens are automatically managed
5. **Password Reset**: Users can request password reset via email
6. **Protected Routes**: Authenticated users can access dashboard

## 🎨 UI Components

### Button Component
- Multiple variants: primary, secondary, outline, ghost
- Different sizes: sm, md, lg
- Loading state support
- Disabled state

### Input Component
- Label support
- Error and helper text
- Left and right icons
- Validation states

### Card Component
- Clean, modern design
- Customizable padding and styling

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 API Integration

The frontend integrates with the Django REST API backend:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: JWT tokens
- **Endpoints**: 
  - `/auth/login/` - User login
  - `/auth/register/` - User registration
  - `/auth/logout/` - User logout
  - `/auth/me/` - Get current user profile
  - And more...

## 🎯 Next Steps

This is the authentication module. Future modules will include:
- User profiles management
- Posts and feed system
- Engagement features (likes, comments)
- Notifications system
- Admin panel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
