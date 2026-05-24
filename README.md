# PhilHealth Case Rate Checklist

A modern, responsive web application for managing PhilHealth case rates, required forms, characteristics, and reports.

## Features

✨ **Modern Design** - Built with React 18 + Tailwind CSS v4  
🌓 **Dark Mode** - Full dark mode support with system preference detection  
📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop  
🔍 **Advanced Filtering** - Search and filter by forms, characteristics, and reports  
📊 **Dual View Modes** - Toggle between table and card layouts  
🎨 **Color-Coded** - Easy-to-identify form types with unique colors  

## Tech Stack

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.1** - Styling
- **Vite 6.3** - Build tool
- **Lucide React** - Icons
- **pnpm** - Package manager

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install pnpm globally (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
pnpm build

# Preview production build locally
pnpm preview
```

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

### Option 3: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

## Project Structure

```
philhealth-checklist/
├── src/
│   ├── app/
│   │   └── App.tsx          # Main application component
│   ├── styles/
│   │   ├── index.css        # Main stylesheet
│   │   ├── tailwind.css     # Tailwind configuration
│   │   ├── theme.css        # Theme variables
│   │   └── fonts.css        # Font imports
│   └── main.tsx             # Application entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── vercel.json              # Vercel deployment config
```

## Data Structure

The application manages 5 key data columns:

1. **Case Rate** - The name of the case rate (e.g., "ACUTE GASTROENTERITIS")
2. **ICD-10** - International Classification of Diseases code
3. **Required Forms** - PhilHealth forms needed (CSF, CF2, SOA, CF4, CF5, SURGICAL MEMO)
4. **Characteristics** - Case-specific characteristics
5. **Reports** - Required reports (RTH MONITORING, AGEING)

## Customization

### Adding New Case Rates

Edit the data constants in `src/app/App.tsx`:

```typescript
const CASE_RATE_NAMES = [
  "YOUR_NEW_CASE_RATE",
  // ... existing rates
];

// Add ICD-10 code
const ICD_MAP = {
  "YOUR_NEW_CASE_RATE": "A00.0",
  // ...
};

// Add required forms
const FORMS_MAP = {
  "YOUR_NEW_CASE_RATE": ["CSF", "CF2"],
  // ...
};
```

### Styling

- Theme colors: `src/styles/theme.css`
- Tailwind config: `src/styles/tailwind.css`
- Global styles: `src/styles/index.css`

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.

---

**Built for NGH · PhilHealth · May 2026**
