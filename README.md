# 🔒 Slock - Secure Encrypted Text Editor

<p align="center">
  <img src="https://img.shields.io/badge/Electron-v33.4-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Security-AES--256--GCM-10B981?style=for-the-badge&logo=letsencrypt&logoColor=white" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/Project-AI%20Assisted%20Hobby-8B5CF6?style=for-the-badge&logo=openai&logoColor=white" alt="AI Assisted Hobby Project" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

**Slock** is a modern desktop text editor designed to protect your sensitive notes and documents with military-grade **AES-256-GCM** encryption. At first glance, it looks like a sleek, minimalist text editor; however, it stores your files in an encrypted format (`.slock`) and prevents reading or modifying content without the correct secret key.

> [!NOTE]
> 🤖 **AI-Assisted Hobby Project**  
> This application is a hobby project created for experimental and learning purposes, co-developed with **Antigravity AI**. While industry-standard cryptographic algorithms (AES-256-GCM + PBKDF2-HMAC-SHA512 with 600,000 iterations) and clean SOLID design principles have been strictly implemented, please use it responsibly.

---

## 🌟 Key Features

- **🔒 Military-Grade Authenticated Encryption (AEAD)**: Uses `AES-256-GCM` to guarantee both data confidentiality and payload integrity (tamper detection).
- **🔑 Robust Key Derivation (KDF)**: Adheres to OWASP recommendations with `PBKDF2-HMAC-SHA512`, 32-byte cryptographically secure random salts, and **600,000 iterations** to withstand brute-force attacks.
- **🎨 Modern Dark Mode UI**:
  - Dynamic line numbers gutter
  - Real-time line, word, and character counters
  - Real-time password strength meter
  - Password show/hide toggle
  - Status badges (`New Document`, `Encrypted`, `Unsaved Changes`)
  - Essential keyboard shortcuts (`Ctrl+N`, `Ctrl+O`, `Ctrl+S`)
- **🛡️ Edge-Case Safety & Memory Hygiene**:
  - Derived encryption key buffers are zeroed out (`Buffer.fill(0)`) immediately after crypto operations.
  - Cryptographic errors are masked to prevent state leaking if a file is tampered with or an incorrect key is provided.
  - Unsaved changes guard to prevent accidental data loss.

---

## 📐 Architecture & SOLID Principles

Slock is built on a clean, testable, multi-layered architecture following strict **Clean Code** standards:

```
src/
├── shared/                   # Shared Data Contracts & Constants
│   ├── types.ts              # IPC & Crypto Interfaces
│   └── constants.ts          # Cryptographic Constants
├── main/                     # Electron Main Process (Node.js)
│   ├── main.ts               # App Lifecycle & Security Policies
│   ├── preload.cjs           # Secure CommonJS contextBridge IPC Bridge
│   ├── services/             # Domain Services
│   │   ├── crypto/           # AES-256-GCM & PBKDF2 Implementations
│   │   ├── file/             # File I/O & Safety Limits
│   │   └── dialog/           # Native OS Dialog Services
│   └── ipc/                  # IPC Handlers (Composition Root)
└── renderer/                 # UI Renderer (Vite + TypeScript + HTML/CSS)
    ├── index.html            # App Layout
    ├── styles/               # Glassmorphic Dark Theme CSS System
    └── src/                  # UI Components & App Controller
```

### Applied SOLID Principles:
- **Single Responsibility Principle (SRP)**: Encryption (`AesGcmCryptoService`), key derivation (`Pbkdf2KdfService`), disk operations (`LocalFileService`), and IPC routing are decoupled.
- **Open/Closed Principle (OCP)**: Crypto services implement interfaces (`ICryptoService`, `IPbkdf2KdfService`), allowing future algorithm strategies (e.g. Argon2id) to be introduced without modifying existing caller code.
- **Liskov Substitution Principle (LSP)**: All services strictly adhere to interface contracts and can be substituted with mock services for testing.
- **Interface Segregation Principle (ISP)**: Interfaces are lean, focused, and minimal.
- **Dependency Inversion Principle (DIP)**: IPC handlers depend on service abstractions rather than concrete classes, injected via `registerIpcHandlers`.

---

## 🔒 Security Model

| Security Layer | Technology / Implementation | Details |
| :--- | :--- | :--- |
| **Encryption Algorithm** | `AES-256-GCM` | 256-bit confidentiality + 128-bit Authentication Tag |
| **Key Derivation (KDF)** | `PBKDF2-HMAC-SHA512` | 600,000 Iterations + 32-byte Cryptographic Salt |
| **Nonce Generation** | `crypto.randomBytes` | Unique 12-byte IV generated per encryption operation |
| **Memory Sanitization** | `Buffer.fill(0)` | Sensitive key buffers wiped from Node.js memory after use |
| **Electron Isolation** | `contextIsolation: true` | Safe IPC bridge isolating Renderer from Node.js runtime |
| **Content Security Policy** | `Content-Security-Policy` | Restricts script execution and prevents XSS attacks |

---

## 🚀 Installation & Local Development

### Requirements
- **Node.js**: v20+ or higher
- **npm**: v9+ or higher

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/slock.git
cd slock
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Cryptographic Security Verification Tests
```bash
npm run test:crypto
```

### 4. Launch Development Mode
```bash
npm run dev
```

---

## 📦 Building Standalone Desktop Executable (`.exe`)

You can package Slock into a Windows Installer (`.exe`) or a Portable single-file executable using `electron-builder`:

### Create Windows Setup Installer (`.exe`):
```bash
npm run package
```
*Outputs **`Slock Setup 1.0.0.exe`** inside the `release/` directory.*

### Create Portable Windows Executable (Portable `.exe`):
```bash
npm run package:portable
```
*Outputs a standalone, zero-installation **`Slock 1.0.0.exe`** inside the `release/` directory.*

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> | Creates a new blank document |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> | Prompts file picker to select and decrypt a `.slock` file |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Encrypts text with key and saves to `.slock` file |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
