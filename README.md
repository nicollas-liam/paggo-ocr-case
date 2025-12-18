Paggo OCR Case - Full Stack Application

  This project is a technical case solution for Paggo. It is a Full Stack application that allows users to upload documents (images), automatically extract text using OCR, and interact with the content using a Large Language Model (LLM).

  Features:

    Authentication: Secure Login and Registration system using JWT.
    OCR Processing: Automatic text extraction from images using Tesseract.js.
    AI Integration: Chat interface powered by Llama 3 (via Groq API) to answer questions based *strictly* on the document context.
    Document Management: History of uploaded files.
    Export: Ability to download the extracted text and chat history as a `.txt` file.

  Tech Stack:

    Backend:
    NestJS: Framework for scalable server-side applications.
    Prisma ORM: Type-safe database client.
    SQLite: Database (Dev environment).
    Tesseract.js: Optical Character Recognition.
    Passport/JWT: Authentication strategies.

    Frontend:
    Next.js: React framework for production.
    Tailwind CSS: Utility-first CSS framework for styling.
    Axios: HTTP Client.

---------------------------------------------------------

Installation & Setup:

  This project includes an automated setup script to make installation seamless. It handles dependency installation, database migration, and environment configuration for both Backend and Frontend.

  Prerequisites
    Node.js (v18 or higher)
    Git
    An API Key from [Groq](https://console.groq.com) (This is optional since the setup script includes a demo key for testing purposes).

  Follow these steps to run the project locally:

    Option 1: Automated Setup (Recommended)

      The `setup.sh` script will install dependencies, configure the SQLite database, ask for your API Key (or use a demo one), and start the application.

      1 - Clone the repository
          bash:
            git clone <YOUR_REPO_URL>
            cd paggo-case

      2 - Run the setup
        bash:
          chmod +x setup.sh  # Gives permission to execute (Mac/Linux)
          ./setup.sh

      3 - Follow the terminal prompts.
        The script will ask for your Groq API Key. If you don't have one, just press ENTER to use the built-in Demo Key. Made that way for the sake of brevity
          The application will start should start automatically, if not, access manually:

            Frontend: http://localhost:3001
            Backend:  http://localhost:3000  
          
    Option 2: Manual Setup

      If you prefer to configure it manually or are using Windows (CMD/PowerShell) without Git Bash:

      1 - Backend setup:
        bash:
          cd backend
          npm install
          cp .env.example .env
          npx prisma migrate dev --name init
          npm run start:dev
      
      2 - Frontend setup: (Open a new terminal window)
        bash:
          cd frontend
          npm install
          npm run dev

      3 - Testing the application:
        Open http://localhost:3001 in your browser.
        Register a new account (Authentication is required).
        Upload an image containing text 
        Click on the document card to open the Chat Interface.
        Ask questions about the document
        Click "Download txt" to export the extraction and chat history.

