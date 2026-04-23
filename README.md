# The Cognitive Sanctuary 🌿

**The Cognitive Sanctuary** is a minimalist, high-performance smart study planner designed to optimize deep work sessions and prevent student burnout. Built with a mindful aesthetic, it features adaptive scheduling, burnout risk detection, and a focused environment for maximum cognitive efficiency.

---

## ✨ Features

- **Mindful Dashboard:** A clean overview of your study status, KPI tracking (Study Hours, Breaks, Mood), and a real-time Burnout Risk gauge.
- **Adaptive Scheduling:** Intelligent task management that separates "Priority Focus" from "Rest Mode" based on your current cognitive load.
- **Session Configuration:** Personalize your deep work environment with mental state selectors and burnout prediction modeling.
- **Data Visualization:** Integrated Recharts to visualize your "Cognitive Focus Flow" and engagement trends.
- **Premium Design:** A minimalist "Forest Green" aesthetic with smooth animations powered by Framer Motion.

---

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Charts:** [Recharts](https://recharts.org/)
- **Routing:** [React Router DOM](https://reactrouter.com/)

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd cognitive-sanctuary
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install core packages (if starting fresh):**
   ```bash
   npm install lucide-react recharts framer-motion react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

### Running the Program

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

---

## 📂 Project Structure

- `src/components/ui/`: Reusable primitive components (Button, Card, Badge).
- `src/components/layout/`: Global layout components (Sidebar, Topbar, Layout).
- `src/pages/`: Individual page implementations (Dashboard, Schedule, Sessions, Login).
- `src/data/mockData.js`: Centralized static data for frontend prototyping. Easily swappable for API calls.

---

## 🛠️ Developer Notes

- **Animations:** All complex staggered animations have been simplified to a single-entry fade-in to ensure high performance and zero lag on all devices.
- **Styling:** The project uses a custom Tailwind color palette (`sanctuary-50` through `sanctuary-950`) defined in `tailwind.config.js`.
- **Responsive:** The layout is designed to be responsive, centering content within a standard container for a balanced desktop experience.

---

## 🧠 Philosophy

The Cognitive Sanctuary is built on the principle of **Mindful Productivity**. Instead of just counting hours, the app tracks cognitive load and energy levels to ensure that students work when they are most capable and rest when they are most vulnerable to burnout.
