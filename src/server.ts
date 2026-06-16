import express, { Request, Response } from 'express';
import cors from 'cors';
import userRouter from './routes/users';
import productRouter from './routes/products';
import orderRouter from './routes/orders';

const app = express();
const port = 3000;

// Configure CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`starting app on: http://localhost:${port}`);
});

export default app;
