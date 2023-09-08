import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { userRouter } from './router/result';

const app = express();
//const prisma = new PrismaClient();

require('dotenv').config()

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3001;

app.use('/staff', userRouter);

app.listen(PORT, () => {
    console.log(`college backend server listening on ${PORT}`)    
})
