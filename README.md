# AI Chatbot

An intelligent chatbot application built with modern web technologies that leverages OpenAI's API to provide natural language processing capabilities.

![insightbot](https://github.com/user-attachments/assets/37bf3f66-2c46-4b67-b6d5-8a27adf5b69c)

## 🚀 Features

- **Natural Language Processing**: Integrated with OpenAI's API to provide intelligent responses
- **Conversation Context**: Maintains conversation history for contextual responses
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **User Authentication**: Secure user authentication powered by Supabase
- **Chat History**: Stores chat history in Supabase database for persistence
- **Modern UI**: Beautiful user interface built with React and ShadCn components

## 🛠️ Tech Stack

### Frontend
- **React.js**: UI library for building the front-end interface
- **ShadCn/UI**: Component library providing beautiful, accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling

### Backend
- **Node.js**: JavaScript runtime for the server
- **Express.js**: Web framework for building the API
- **OpenAI API**: Natural language processing capabilities
- **Supabase**: Database, authentication, and storage services

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- An [OpenAI API](https://platform.openai.com/) account and API key
- A [Supabase](https://supabase.com/) account and project set up

## 🔧 Installation & Setup

### Clone the repository

```bash
git clone https://github.com/aqibaliakbar/AI-Chatbot--OpenAI--Node--Express--Supabase--Reactjs--ShadCn-.git
cd AI-Chatbot--OpenAI--Node--Express--Supabase--Reactjs--ShadCn-
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
PORT=8000
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

4. Start the backend server:
```bash
npm start
```

### Frontend Setup

1. Open a new terminal window/tab and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory with the following content:
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the frontend development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📝 Usage

1. Register for an account or log in if you already have one
2. Start a new chat by typing in the message input at the bottom of the screen
3. View your conversation history by navigating through the sidebar
4. The chatbot will respond based on the context of your conversation

## 🔒 Environment Variables

### Backend
- `PORT`: Port number for the server (default: 8000)
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anonymous key

### Frontend
- `VITE_API_URL`: URL of the backend API
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 API Documentation

The backend provides the following API endpoints:

- `POST /api/chat`: Send a message to the chatbot
  - Request body: `{ message: string, user_id: string }`
  - Response: `{ reply: string }`

- `GET /api/chat/history/:userId`: Get chat history for a user
  - Response: `[{ message: string, reply: string, timestamp: string }]`

## 🚀 Deployment

### Backend Deployment
1. Ensure your environment variables are properly set up
2. Build the backend:
```bash
cd backend
npm run build
```

### Frontend Deployment
1. Build the frontend:
```bash
cd frontend
npm run build
```
2. Deploy the contents of the `dist` directory to your hosting provider

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [OpenAI](https://openai.com/) for providing the NLP capabilities
- [Supabase](https://supabase.com/) for the backend infrastructure
- [ShadCn/UI](https://ui.shadcn.com/) for the beautiful UI components
- [React](https://reactjs.org/) for the frontend framework
- All the open-source libraries and tools used in this project
