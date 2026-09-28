import { Router } from 'express';
import { MailboxController } from '../controllers/mailbox.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', MailboxController.list);
router.post('/', MailboxController.create);
router.delete('/:id', MailboxController.delete);
router.patch('/:id/toggle', MailboxController.toggleActive);

export default router;
