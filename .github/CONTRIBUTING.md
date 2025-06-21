# 🤝 Contributing to Simple Memory MCP

Thank you for your interest in contributing to Simple Memory MCP! This document provides guidelines and information for contributors.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/simple-memory-mcp.git
   cd simple-memory-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Run tests to ensure everything works**
   ```bash
   npm test
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Making Changes

### Branch Naming Convention
- `feature/description` - for new features
- `bugfix/description` - for bug fixes
- `docs/description` - for documentation changes
- `refactor/description` - for code refactoring

### Commit Message Format
Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(web): add memory search functionality`
- `fix(database): resolve SQLite connection issue`
- `docs(readme): update installation instructions`

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Tests
- Place test files in the `tests/` directory
- Use descriptive test names
- Follow the existing test patterns
- Ensure good test coverage for new features

## 📤 Submitting Changes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the provided PR template
   - Provide clear description of changes
   - Link related issues
   - Request review from maintainers

### Review Process
- All PRs require at least one review
- CI tests must pass
- Code coverage should not decrease
- Documentation must be updated for new features

## 🎯 Areas for Contribution

We welcome contributions in these areas:
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🧪 Test coverage
- ⚡ Performance optimizations
- 🌐 Internationalization
- 🎨 UI/UX improvements

## 📞 Getting Help

If you need help or have questions:
- Open an issue for bugs or feature requests
- Check existing issues and discussions
- Contact maintainers through GitHub

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Simple Memory MCP! 🎉
