import { Request, Response } from 'express';
import { runBenchmark } from '../api-test';


export async function testStackRabbitRoute(req: Request, res: Response) {
    const response = await runBenchmark();
    res.status(200).send(response);
}