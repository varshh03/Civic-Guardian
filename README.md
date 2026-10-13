# Civic Guardian

## AI-Powered Civic Issue Reporting and Management System

Civic Guardian is an AI-powered web application designed to simplify the reporting and management of civic issues. It enables citizens to report problems such as road damage, water leakage, and non-functional streetlights by uploading images, identifying issue severity, providing location details, and generating structured complaints.

The system aims to improve communication between citizens and local authorities, support faster issue identification, and make civic complaint management more transparent and efficient.

## Problem Statement

Civic issues such as damaged roads, water leakage, and broken streetlights often go unreported or take considerable time to reach the appropriate authorities. Traditional complaint processes can be difficult to access, lack proper location details, and provide limited visibility into complaint progress.

Civic Guardian addresses these challenges through image-based issue reporting, AI-assisted analysis, location mapping, complaint generation, and status tracking.

## Key Features

- **User Authentication:** Secure user registration and login.
- **Image-Based Reporting:** Upload photographs of civic issues for analysis.
- **AI-Powered Issue Analysis:** Analyze uploaded images and generate issue descriptions using AI services.
- **Severity Classification:** Categorize reported issues as Low, Medium, or High priority.
- **Complaint Generation:** Generate structured complaint details based on the reported issue.
- **Location Management:** Support location tagging through GPS and manual location entry.
- **Department Assignment:** Identify the appropriate department for the reported issue.
- **Interactive Map:** Display reported issues using Leaflet and OpenStreetMap.
- **Complaint Tracking:** Monitor complaint status and updates.
- **Duplicate Issue Detection:** Help identify potentially repeated reports of the same issue.
- **Administrative Dashboard:** Support complaint monitoring and management.
- **Tamil Language Support:** Intended to improve accessibility for Tamil-speaking users.

## Supported Civic Issues

Civic Guardian currently focuses on the following categories:

1. Road damage and potholes
2. Water leakage and plumbing issues
3. Non-functional streetlights

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Backend | Python, FastAPI |
| AI Integration | OpenRouter API |
| Database | Supabase PostgreSQL |
| Authentication | Backend authentication system |
| Mapping | Leaflet, OpenStreetMap |
| Image Processing | Image upload and AI-based analysis |
| Version Control | Git, GitHub |

## System Workflow

1. The user registers or logs in to the application.
2. The user uploads an image of a civic issue.
3. The backend processes the submitted image and sends it for AI-assisted analysis.
4. The AI service generates an issue description and helps determine the issue category and severity.
5. The user reviews and edits the complaint details if necessary.
6. The user provides the issue location using GPS or manual entry.
7. The complaint is associated with the relevant department.
8. The complaint details are stored in the database.
9. Users can track complaint progress, while administrators can review and manage reported issues.

## Project Architecture

The application follows a frontend-backend architecture.

- **Frontend:** Provides the user interface for authentication, image uploads, complaint creation, location selection, maps, and tracking.
- **Backend:** Handles API requests, authentication, image processing, AI integration, complaint management, and database communication.
- **AI Service:** Uses an OpenRouter-hosted language model to assist with image interpretation and complaint description generation.
- **Database:** Uses Supabase PostgreSQL to store application data.
- **Mapping Service:** Uses Leaflet and OpenStreetMap to support location-based complaint reporting.

Note: AI-generated classifications depend on the implemented backend logic and the configured model. A dedicated YOLO object-detection model should only be considered active if it is actually integrated into the application's inference pipeline.

## Project Structure

The project is organized into separate frontend and backend directories.

```text
Civic-Guardian/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   └── routers/
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md
```

The exact directory structure may vary depending on the current implementation.

## Prerequisites

Before running the project, install the following:

- Python 3.10 or later
- Node.js and npm
- Git
- A Supabase project with PostgreSQL access
- An OpenRouter API key

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Civic-Guardian
```

Replace `<YOUR_REPOSITORY_URL>` with the URL of your GitHub repository.

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file using `.env.example` as a reference and configure the required environment variables.

Typical configuration values may include:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_URL=your_database_connection_string
```

Use the actual variable names expected by your backend configuration. Do not commit your `.env` file or expose API keys, database credentials, or authentication secrets.

### 3. Start the Backend Server

From the backend directory, run:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://localhost:8000
```

FastAPI interactive API documentation is typically available at:

```text
http://localhost:8000/docs
```

The port may differ if it is configured differently in your application.

### 4. Configure the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local frontend URL displayed in the terminal. For a standard Vite configuration, this is commonly:

```text
http://localhost:5173
```

Ensure the frontend API configuration points to the running backend server.

## Environment Variables and Security

Keep all sensitive configuration in environment variables.

- Never commit `.env` files.
- Never expose API keys in frontend code.
- Use `.env.example` to document required configuration without including actual secrets.
- Configure appropriate CORS origins for local development and production.
- Protect authenticated endpoints and validate uploaded files.
- Apply appropriate access controls to administrative features.

## Future Enhancements

- Integrate a dedicated YOLO model for object detection and localization.
- Improve duplicate complaint detection using image similarity and geographic proximity.
- Add notifications for complaint status changes.
- Introduce department-level analytics and performance reports.
- Improve Tamil-language support across the application.
- Add SLA monitoring and escalation for unresolved complaints.
- Deploy the application to a production environment.
- Add comprehensive testing and monitoring.

## Expected Impact

Civic Guardian aims to make civic issue reporting more accessible, structured, and transparent. By combining AI-assisted analysis, location-based reporting, and complaint management, the platform can help citizens communicate local problems more effectively and help authorities prioritize their resolution.

## Project Status

Under Development

Features and integrations may evolve as the project progresses.

## License

A license has not yet been specified. Add an appropriate license file before distributing the project under open-source terms.

## Author

Developed as an AI-powered civic technology project focused on improving civic issue reporting and management.
