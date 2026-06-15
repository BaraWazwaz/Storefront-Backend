import express, { Request, Response } from 'express'

const app  = express();
const port = 3000;

// alternative to bodyParser, because it is depricated
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => res.send('Hello World!'));

app.listen(port, () => console.log(`starting app on: http://localhost:${port}`));
