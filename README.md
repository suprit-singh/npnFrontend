# RouteOptimizer - Complete JSX Project

A modern route optimization application built with React and Tailwind CSS. This project provides an intuitive interface for planning optimal routes with authentication, route input, results visualization, and an AI chatbot assistant.

## Features

- **Authentication System**: Secure signup/login with form validation
- **Route Planning**: Input starting location, destination, and optional stops
- **Route Optimization**: Simulated intelligent route optimization with efficiency metrics
- **Results Visualization**: Interactive results page with route details and optimization summary
- **AI Chatbot Assistant**: Floating chatbot to help users understand optimization results
- **Responsive Design**: Professional interface that works across all devices
- **Modern UI**: Clean design with soft blues and greens, rounded cards, and smooth animations

## Project Structure

```
complete-jsx-project/
├── App.jsx                 # Main application component
├── index.html             # HTML template
├── main.jsx               # React application entry point
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── components/
│   ├── AuthPage.jsx       # Authentication page
│   ├── RouteInput.jsx     # Route planning input form
│   ├── ResultsPage.jsx    # Optimized route results
│   ├── ChatBot.jsx        # AI assistant chatbot
│   └── ui/                # Reusable UI components
│       ├── button.jsx
│       ├── input.jsx
│       ├── card.jsx
│       ├── label.jsx
│       ├── badge.jsx
│       └── utils.js
└── styles/
    └── globals.css        # Global styles and CSS variables
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd complete-jsx-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Authentication**: Start by creating an account or signing in (demo mode allows any email/password)
2. **Route Planning**: Enter your starting location, destination, and any optional stops
3. **Optimization**: Click "Optimize Route" to generate an efficient route plan
4. **Results**: View detailed results including distance, time, efficiency metrics, and route visualization
5. **AI Assistant**: Use the floating chatbot to ask questions about your route optimization

## Dependencies

### Core Dependencies
- **React**: Frontend framework
- **Lucide React**: Icon library
- **Radix UI**: Accessible UI primitives
- **Class Variance Authority**: Component variant management
- **clsx & tailwind-merge**: Utility for conditional classes

### Development Dependencies
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS & Autoprefixer**: CSS processing

## Customization

### Styling
- Modify colors and design tokens in `styles/globals.css`
- Update Tailwind configuration in `tailwind.config.js`
- Component-specific styles can be adjusted in individual JSX files

### Features
- Route optimization logic can be enhanced in `RouteInput.jsx` and `ResultsPage.jsx`
- Chatbot responses can be customized in `ChatBot.jsx`
- Authentication can be connected to a real backend service

## Browser Support

This application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the package.json file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or issues, please open an issue in the project repository.