import anyRouter from 'any-router';

import { Help } from './controllers/meta';

const router = new anyRouter();

router.add('$help', Help);

export default router;
