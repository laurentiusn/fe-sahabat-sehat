# Sahabat Sehat (Front-End)

Project ini dibangun menggunakan teknologi modern berikut:

- **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI based)
- **Icons:** [Lucide React](https://lucide.dev/) & [Tabler Icons](https://tabler.io/)
- **Routing:** [React Router DOM v7](https://reactrouter.com/)
- **State Management / Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Date Utility:** [Date-fns](https://date-fns.org/)


## 🚀 Cara Setup Project (Installation)

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer lokal (localhost).

### 1. Clone Repository

```bash
git clone https://github.com/laurentiusn/fe-sahabat-sehat.git

cd fe-sahabat-sehat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
```

Buka `.env` dan masukkan **Link API**

```bash
VITE_API_BASE_URL=https://link.domain/api
```

### 4. Run Development Server

```bash
npm run dev
```