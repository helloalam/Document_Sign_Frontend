# 📄 React DocSign Frontend

A React-based frontend for a document signing web app. It allows users to
upload a PDF, drag and drop text or image signatures, preview the signed
PDF, and download or send it via email.

## 🚀 Features

- User authentication (login/signup)
- Upload and view PDF documents
- Drag-and-drop signature placement (text/image)
- Supports multiple signatures and pages
- Preview and download signed documents
- Responsive and mobile-friendly UI

## 🛠️ Tech Stack

- React + Vite
- React-PDF (`react-pdf`)
- DnD Kit (`@dnd-kit/core`)
- Tailwind CSS
- Axios

## 📂 Project Structure


src/
├── components/ # Reusable components
├── pages/ # Page-level components (Dashboard, SignPage, etc.)
├── context/ # Auth context
├── utils/ # API config and helpers
└── App.jsx # App entry point

bash
Copy
Edit

## 🔧 Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/docsign-frontend.git
Install dependencies:

bash
Copy
Edit
npm install
Set environment variables:

Create a .env file in the root:

bash
Copy
Edit
VITE_API_BASE_URL=http://localhost:5000/api
Start the dev server:

bash
Copy
Edit
npm run dev
📸 Screenshots
(Add screenshots here showing PDF upload, drag/drop, and final output)

📦 Backend
This frontend works with a Node.js + MongoDB backend. You can find it at:

👉 docsign-backend

✅ To Do
Add delete/edit signature feature

Improve mobile UI/UX

Add audit logs for signature events

📄 License
MIT © [Your Name]

yaml
Copy
Edit

---

Let me know if you want to **add badges**, **hosted demo links**, or make it more advanced (like internat