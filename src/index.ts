import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { userRouter } from './router/result';
import { loginRouter } from './router/login';

const app = express();
//const prisma = new PrismaClient();

require('dotenv').config()

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3001;

app.use('/staff', userRouter, loginRouter);

app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});

app.listen(PORT, () => {
    console.log(`College backend server listening on ${PORT}`)    
})
