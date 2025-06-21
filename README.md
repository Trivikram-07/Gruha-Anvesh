# Gruha Anvesh - PG, BHK & Vacation Rental Platform

---

## 🏠 Overview
Gruha Anvesh is a full-stack web application designed to streamline the process of listing and booking Paying Guest (PG) accommodations, BHKs (Bedroom-Hall-Kitchen apartments), and vacation rentals. 

### Key Highlights:
- Real-time chat for seamless communication.
- Immersive **3D property views** to enhance trust and decision-making.
- Interactive **map integration** for better accessibility and exploration.
- **Multi-Armed Bandit (MAB)** algorithm for personalized property recommendations.



---

## 🚀 Features
- **Personalized Recommendations**  
  Utilizes the Multi-Armed Bandit (MAB) algorithm to recommend properties tailored to user preferences based on interaction data (likes, clicks, time spent).
  
- **Real-Time Chat**  
  Enables seamless communication between users and property owners using Socket.io.

- **3D Property Views**  
  Offers immersive 3D visualizations of properties to enhance trust and decision-making.

- **Map Integration**  
  Displays property locations interactively for better accessibility and exploration.

- **User-Friendly Interface**  
  Built with React for a responsive and intuitive front-end experience.

---

## 📈 Impact
- Streamlines the booking process for PGs, BHKs, and vacation rentals.
- Builds trust through immersive **3D property previews**.
- Boosts user engagement with personalized recommendations.

---

## 🛠 Tech Stack
| **Category**         | **Technology**          |
|-----------------------|-------------------------|
| **Frontend**         | React                  |
| **Backend**          | Node.js, Express.js    |
| **Database**         | MongoDB                |
| **Real-Time Chat**   | Socket.io              |
| **Image Storage**    | Cloudinary             |
| **Recommendation**   | Multi-Armed Bandit (MAB) |
| **Deployment**       | Render                 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB instance (local or cloud-based)
- Cloudinary account for image storage
- Render account for deployment (optional)

---

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gruha-anvesh
Install dependencies for both frontend and backend:

bash
Copy
Edit
# Backend
```
cd backend
npm install
```
# Frontend
```
cd ../frontend
npm install
Set up environment variables:
Create a .env file in the backend directory with the following:
```
🌳# Environment
```
env
Copy
Edit
MONGODB_URI=<your-mongodb-connection-string>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
Running the Application
Start the backend server:
```
```bash
 Copy
 Edit
 cd backend
 npm run start
 Start the frontend development server:
```
```bash
Copy
Edit
cd frontend
npm run start
Open your browser and navigate to http://localhost:3000 to view the application.
```
# 🌍 Deployment
The application is deployed on Render. To deploy your own instance:

Push your code to a GitHub repository:

```bash
Copy
Edit
git add .
git commit -m "Initial commit"
git push origin main
Connect the repository to Render.
```
Configure environment variables in the Render dashboard.

Deploy the backend and frontend services separately.

# 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding standards and includes appropriate tests
