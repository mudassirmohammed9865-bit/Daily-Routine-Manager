# Daily Routine Planner

A full-stack web application for managing daily routines with user authentication and real-time task management.

## Features

✅ User Authentication (Sign up / Login)  
✅ Create, Read, Update, Delete routines  
✅ Track completion status  
✅ Progress visualization  
✅ Responsive design  
✅ Secure JWT-based authentication  
✅ MongoDB database integration  

## Tech Stack

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for password hashing

## Project Structure

```
routine/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── routine.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── style.css
│   ├── script.js
│   └── images/
├── package.json
└── render.yaml
```

## Local Setup

### Prerequisites
- Node.js (v24 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd routine
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in backend/
   cp .env.example .env
   
   # Edit .env with your MongoDB URI and JWT secret
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

The application will run on `http://localhost:5000`

## Deployment to Render

### Prerequisites
- Render.com account
- MongoDB Atlas account (for production database)
- GitHub repository with your code

### Deployment Steps

1. **Create MongoDB Atlas Database**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user with secure password
   - Get your connection string (with username/password)

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

3. **Deploy on Render**
   - Go to [Render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `routine-planner` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Click "Create Web Service"

4. **Add Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add the following secrets:
     ```
     MONGO_URI: mongodb+srv://username:password@cluster.mongodb.net/routine
     JWT_SECRET: (generate a strong random string)
     ```
   - Other variables already in render.yaml:
     ```
     NODE_ENV: production
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://routine-planner.onrender.com`

## Environment Variables

### Backend (.env)

```env
# MongoDB Connection String
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/routine

# JWT Secret (use a strong random string, minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port (Render will set this automatically)
PORT=5000

# Node Environment
NODE_ENV=production
```

## API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - Login user

### Routines (requires JWT token)
- `POST /add` - Create new routine
- `GET /get/:date` - Get routines for a specific date
- `PUT /update/:id` - Update routine
- `DELETE /delete/:id` - Delete routine

## Security Considerations

✅ Passwords hashed with bcrypt  
✅ JWT tokens for secure authentication  
✅ CORS enabled for frontend communication  
✅ Environment variables for sensitive data  
✅ Input validation on backend  
✅ User isolation (each user can only access their own routines)  

## Troubleshooting

### MongoDB Connection Error
- Verify `MONGO_URI` is correct
- Check MongoDB username/password
- Ensure IP whitelist includes Render's IP or use 0.0.0.0/0

### 401 Unauthorized
- Ensure token is being sent in `Authorization` header
- Check that `JWT_SECRET` matches between deployments

### Routines Not Loading
- Check MongoDB connection
- Verify user is authenticated
- Check browser console for errors

## Performance

- Optimized database queries with userId filtering
- Efficient JWT authentication
- Responsive design for mobile devices
- Static file serving with Express

## Future Enhancements

- Email verification
- Password reset functionality
- Routine templates
- Export to PDF/CSV
- Mobile app
- Dark mode toggle
- Recurring routines
- Routine sharing

## License

ISC

## Support

For issues or questions, please open an issue on the GitHub repository.
