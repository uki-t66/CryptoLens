import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import cookieParser from 'cookie-parser';
import txRoutes from './routes/tx-routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL,  // フロントエンドのURL
    credentials: true,  // Cookie送受信の許可
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization','Set-Cookie']
  }));
  
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes); 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});