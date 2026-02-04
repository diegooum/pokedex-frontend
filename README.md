# 🔴 Pokédex SaaS - Team Analytics Platform

![React](https://img.shields.io/badge/frontend-React_19-blue)
![Vite](https://img.shields.io/badge/build-Vite-purple)
![Status](https://img.shields.io/badge/status-live-green)

**A Full Stack SaaS application for Pokémon team management and algorithmic analysis.** Built with a modern architecture using **React**, **NestJS**, and **PostgreSQL**.

🔗 **Live Demo:** [Click here to open the App](https://pokedex-frontend-dbjv.vercel.app)

---

## 📸 Project Preview

| Team Dashboard (Dock) | AI Analysis Report |
|:---:|:---:|
| ![Dashboard](https://via.placeholder.com/600x400?text=Upload+Your+Dashboard+Screenshot) | ![Analysis](https://via.placeholder.com/600x400?text=Upload+Analysis+Screenshot) |
*(Note: Please upload your actual screenshots to the repo and update these links)*

---

## 🚀 Key Features

* **🔐 Secure Authentication:** Complete Login/Register system using **JWT** (connected to Backend).
* **📊 Team Analytics Engine:**
    * **MVP Calculation:** Automatically identifies the most valuable Pokémon in your team.
    * **Radar Charts:** Visualizes team balance (Attack vs Defense vs Speed).
    * **Type Coverage:** Diagnoses weaknesses in your team composition.
* **🤖 Smart Recommendations:** Implements a **KNN (K-Nearest Neighbors)** algorithm to suggest similar Pokémon.
* **💾 Persistent Data:** Saves your teams and favorites to a cloud PostgreSQL database.
* **🎨 Retro-Modern UI:** "PokeOS" Design System with 8-Bit mode and Glassmorphism.

---

## 🛠️ Tech Stack (Frontend)

* **Framework:** React 18+ with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Data Visualization:** Recharts (Radar & Pie Charts)
* **State Management:** React Hooks
* **HTTP Client:** Axios
* **Deployment:** Vercel

---

## ⚙️ Local Installation

To run this frontend locally:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/pokedex-frontend.git](https://github.com/YOUR_USERNAME/pokedex-frontend.git)
    cd pokedex-frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_URL=http://localhost:3000
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 👨‍💻 Author

**Diego** - *Business Informatics Student*

---
*Powered by PokéAPI & NestJS Backend.*