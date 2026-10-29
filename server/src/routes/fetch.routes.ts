import { Router } from 'express';
import { handleFetch } from '../controllers/fetch.controller.js';

export const fetchRouter = Router();

fetchRouter.get('/', handleFetch);
