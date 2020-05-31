import anyRouter from 'any-router';
import { Help } from './controllers/commands';

const router = new anyRouter();

router.add('$help', Help);
router.add('$automode', Help);

export default router;
