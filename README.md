# Housenumbers UI

A modern, responsive web application for AI-powered text summarization built with Remix, TypeScript, and Tailwind CSS. Developed following **Test-Driven Development (TDD)** principles with comprehensive test coverage.

## Features

- **Secure Authentication** - JWT-based login with hardcoded credentials and custom credential option
- **AI Text Summarization** - Create summaries using OpenAI GPT-3.5-turbo
- **Summary Management** - View, select, edit, and delete previous summaries
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates** - Instant UI updates when creating or deleting summaries
- **Modern UI/UX** - Clean, intuitive interface with excellent user experience
- **Comprehensive Testing** - 35+ tests covering all critical user flows and edge cases

## Tech Stack

- **Framework**: Remix (React Router v7)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Authentication**: Cookie-based sessions
- **API Integration**: Custom API client for housenumbers-api
- **Testing**: Vitest + React Testing Library + TDD approach

## Prerequisites

- Node.js 20+ 
- The housenumbers-api running on port 3000

## Getting Started

### 1. Clone Repository and Install Dependencies

```bash
git clone https://github.com/afscomercial/housenumbers-ui.git
cd housenumbers-ui
npm install
```

### 2. Environment Setup

Copy the environment variables:

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
SESSION_SECRET=super-secret-session-key-change-in-production
API_BASE_URL=http://localhost:3000
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Default Login Credentials

- **Username**: `admin`
- **Password**: `password`

### Custom Credentials

Check the "Use custom credentials" checkbox on the login page to enter your own username and password.

### Creating Summaries

1. Log in to access the dashboard
2. Enter or paste text in the text area
3. Click "Generate Summary" to create an AI-powered summary
4. View the generated summary below the text area

### Managing Summaries

- **View Previous Summaries**: All summaries are listed in the sidebar
- **Select Summary**: Click on any previous summary to load it in the editor
- **Delete Summary**: Click the delete icon (trash) next to any summary
- **Create New**: Click "New Summary" to start fresh

## API Integration

The app connects to the housenumbers-api with the following endpoints:

- `POST /auth/login` - Authentication
- `GET /snippets` - Fetch all summaries
- `POST /snippets` - Create new summary
- `DELETE /snippets/:id` - Delete summary

### API Usage Examples

For direct API testing, you can use cURL commands:

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password_123"
  }'

# Create a snippet with AI summary (replace YOUR_JWT_TOKEN)
curl -X POST http://localhost:3000/snippets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Your text to summarize here..."
  }'
```

For complete API documentation, see the [housenumbers-api repository](https://github.com/afscomercial/housenumbers-api).

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run all tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI interface
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## Testing

This project follows **Test-Driven Development (TDD)** principles with comprehensive test coverage.

### Test Structure

```
app/
├── lib/
│   ├── api.ts                 # API client
│   └── api.test.ts           # API client tests (9 tests)
├── routes/
│   ├── dashboard.tsx         # Dashboard component  
│   ├── dashboard.test.tsx    # Dashboard tests (19 tests)
│   ├── login.tsx             # Login component
│   └── login.test.tsx        # Login tests (7 tests)
├── test-utils.ts             # Shared test utilities
└── test-setup.ts             # Global test setup
```

### Test Coverage

**35 tests** covering all critical functionality:

#### API Client Tests (9 tests)
- Authentication (login success/failure)
- Snippet creation (validation, errors, success)
- Snippet retrieval (success, empty states)
- Snippet deletion (success, not found errors)

#### Login Component Tests (7 tests)
- UI rendering (form elements, labels, buttons)
- Default credentials behavior
- Custom credentials toggle
- Error message display
- Form validation and structure

#### Dashboard Component Tests (19 tests)
- Header and navigation rendering
- Form interactions and validation
- Snippet selection and editing
- Delete operations with confirmation
- Loading states and error handling
- Empty states and responsive layout
- User interactions (text input, buttons, forms)

### Testing Philosophy

- **Co-located Tests**: Test files are placed next to their source files for easier maintenance
- **User-Centric Testing**: Tests focus on user interactions rather than implementation details
- **Comprehensive Mocking**: Proper mocking of Remix hooks, API calls, and external dependencies
- **Edge Case Coverage**: Tests include error scenarios, validation, and boundary conditions

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run specific test file
npm test dashboard.test.tsx

# Run tests with verbose output
npm test -- --reporter=verbose
```

### Test Utilities

The project includes shared test utilities:

- **Mock Helpers**: Reusable functions for mocking API responses
- **Test Data**: Consistent mock data for users, snippets, and responses
- **Setup Functions**: Automated test environment configuration

### Writing New Tests

When adding new features:

1. **Write tests first** (TDD approach)
2. **Co-locate tests** with source files
3. **Use descriptive test names** that explain the behavior
4. **Test user interactions** rather than implementation details
5. **Include error scenarios** and edge cases

Example test structure:
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks and initial state
  })

  it('should render correctly with default props', () => {
    // Test rendering
  })

  it('should handle user interactions', () => {
    // Test user flows
  })

  it('should display error states appropriately', () => {
    // Test error handling
  })
})
```

## Responsive Design

The application is fully responsive with:

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layout for tablets
- **Desktop**: Full-width layout with sidebar for larger screens
- **Touch Friendly**: Large tap targets and intuitive gestures

## UX Features

- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client and server-side validation
- **Confirmation Dialogs**: Prevent accidental deletions
- **Auto-refresh**: Real-time updates after actions
- **Visual Feedback**: Hover states and transitions

## Project Structure

```
app/
├── lib/
│   ├── api.ts                # API client and types
│   ├── api.test.ts          # API client tests
│   └── auth.server.ts       # Server-side authentication
├── routes/
│   ├── _index.tsx           # Root route with redirects
│   ├── login.tsx            # Login page
│   ├── login.test.tsx       # Login component tests
│   ├── dashboard.tsx        # Main dashboard
│   └── dashboard.test.tsx   # Dashboard component tests
├── test-utils.ts            # Shared testing utilities
├── test-setup.ts            # Global test configuration
├── root.tsx                 # Root layout
└── tailwind.css             # Tailwind styles

public/
├── favicon.ico              # App favicon
├── logo-dark.png           # Dark theme logo
└── logo-light.png          # Light theme logo

config/
├── vitest.config.ts        # Test configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── postcss.config.js       # PostCSS configuration
```

## Deployment

### Local Development Build

```bash
npm run build
```

### Deploy

The built application will be in the `build/` directory. You can deploy it to any Node.js hosting service:

```bash
npm start
```

### Docker Deployment

The application includes Docker configuration for containerized deployment.

#### Build Docker Image

```bash
# Build the Docker image
docker build -t housenumbers-ui .

# Run the container
docker run -p 3000:3000 \
  -e SESSION_SECRET="your-session-secret" \
  -e API_BASE_URL="https://your-api-url.com" \
  housenumbers-ui
```

#### Docker Features

- **Multi-stage build**: Optimized for production
- **Alpine Linux**: Small footprint (~100MB final image)
- **Non-root user**: Enhanced security
- **Health checks**: Built-in monitoring endpoint at `/health`
- **Production ready**: Configured for cloud deployment

#### Environment Variables

```bash
# Required
SESSION_SECRET=your-super-secure-session-secret
API_BASE_URL=https://your-api-domain.com

# Optional
NODE_ENV=production
PORT=3000
```

### 🚂 Railway Deployment

For detailed Railway deployment instructions, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md).

#### Quick Railway Setup

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables:
   - `SESSION_SECRET`: Strong random secret
   - `API_BASE_URL`: Your deployed API URL
4. Deploy automatically with Railway's Dockerfile detection

The application will be available at your Railway-provided URL with automatic HTTPS and monitoring.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Secret key for session encryption | Required |
| `API_BASE_URL` | Base URL for the housenumbers-api | `http://localhost:3000` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. **Write tests first** (follow TDD principles)
4. Implement the feature
5. Ensure all tests pass (`npm test`)
6. Run linting and type checking (`npm run lint` && `npm run typecheck`)
7. Submit a pull request

### Development Workflow

1. **TDD Approach**: Write failing tests first
2. **Implement**: Write minimal code to make tests pass
3. **Refactor**: Improve code while keeping tests green
4. **Co-locate**: Place test files next to source files
5. **Document**: Update README and comments as needed


