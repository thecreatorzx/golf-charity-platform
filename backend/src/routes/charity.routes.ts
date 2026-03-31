import { Router } from 'express'
import {
  listCharities,
  getCharity,
  addCharity,
  editCharity,
  removeCharity,
  selectUserCharity,
  fetchUserCharity,
  donateToCharity
} from '../controllers/charity.controller'
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware'

const router = Router()

router.get('/', listCharities)

router.get('/user/mine', authenticate, fetchUserCharity)
router.post('/user/select', authenticate, selectUserCharity)
router.post('/donate', authenticate, donateToCharity)

router.get('/:id', getCharity)
router.put('/:id', authenticate, authorizeAdmin, editCharity)
router.delete('/:id', authenticate, authorizeAdmin, removeCharity)
router.post('/', authenticate, authorizeAdmin, addCharity)


export default router