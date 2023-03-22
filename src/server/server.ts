import { NextFunction, Router } from 'express'
import expressBasicAuth from 'express-basic-auth'
import { body, header, param } from 'express-validator'
import register from './register'
import { CreateKillRecord, CheckServerToken } from '../db/db'
import { validateErrors } from '../common'

const router = Router()

router.use('/', register)

//auth middleware
router.post(
  '/:serverId*',
  header('authorization')
    .exists({ checkFalsy: true })
    .withMessage('Missing Authorization Header')
    .bail()
    .contains('Basic')
    .withMessage('Authorization Token is not Basic'),
  validateErrors,
  //Huge mess to retrieve server id from expressBasicAuth. We probably should fix it.
  (req, res, next) => {
    if (!req) res.sendStatus(500)
    return expressBasicAuth({
      authorizeAsync: true,
      authorizer: CheckServerToken.bind(req),
      unauthorizedResponse: { error: 'invalid credentials' }
    })(req as any, res, next)
  }
)

//Route to check auth
router.post('/:serverId', (req, res) => {
  res.sendStatus(200)
})

const serversCount: { [id: string]: number } = {}
const serversTimeout: { [id: string]: NodeJS.Timeout } = {}

//same rate limiting code as register. max 10 kills per server every 1 sec. should be enough.
router.post('/:serverId/kill', (req, res, next) => {
  let serverId = Number(req.query.serverId)
  if (serversCount[serverId] > 2) {
    return res.status(429).json({
      error: 'too many requests. Are players really making that much kills ?'
    })
  }
  clearTimeout(serversTimeout[serverId])
  serversCount[serverId] =
    serversCount[serverId] ?? (serversCount[serverId] + 1) | 1
  serversTimeout[serverId] = setTimeout(() => {
    serversCount[serverId] = 0
  }, 1000)
  next()
})

router.post(
  '/:serverId/kill',
  param('serverId').exists().toInt().isInt(),
  body([
    'attacker_current_weapon_mods',
    'attacker_weapon_1_mods',
    'attacker_weapon_2_mods',
    'attacker_weapon_3_mods',
    'attacker_offhand_weapon_1',
    'attacker_offhand_weapon_2',
    'victim_current_weapon_mods',
    'victim_weapon_1_mods',
    'victim_weapon_2_mods',
    'victim_weapon_3_mods',
    'victim_offhand_weapon_1',
    'victim_offhand_weapon_2'
  ])
    .default(0)
    .toInt()
    .isInt()
    .withMessage('must be a valid int'),
  body(['distance', 'player_count'])
    .toInt()
    .isInt()
    .withMessage('must be a valid int'),
  body(['distance', 'game_time'])
    .toFloat()
    .isFloat()
    .withMessage('must be a valid float'),
  body(
    [
      'attacker_id',
      'victim_id',
      'killstat_version',
      'match_id',
      'game_mode',
      'map',
      'attacker_name',
      'attacker_current_weapon',
      'attacker_weapon_1',
      'attacker_weapon_2',
      'attacker_weapon_3',
      'victim_name',
      'victim_current_weapon',
      'victim_weapon_1',
      'victim_weapon_2',
      'victim_weapon_3',
      'cause_of_death'
    ],
    'must be composed of a maximum of 50 valid ascii characters'
  )
    .isString()
    .isLength({ max: 50 })
    .isAscii(),
  body(['distance', 'game_time'], 'must be postitive floats').isFloat({
    min: 0
  }),
  body(['cause_of_death', 'victim_id'], 'mandatory').exists().notEmpty(),
  validateErrors,
  (req, res) => {
    const {
      killstat_version,
      match_id,
      game_mode,
      map,
      game_time,
      player_count,
      attacker_name,
      attacker_id,
      attacker_current_weapon,
      attacker_current_weapon_mods,
      attacker_weapon_1,
      attacker_weapon_1_mods,
      attacker_weapon_2,
      attacker_weapon_2_mods,
      attacker_weapon_3,
      attacker_weapon_3_mods,
      attacker_offhand_weapon_1,
      attacker_offhand_weapon_2,
      victim_name,
      victim_id,
      victim_current_weapon,
      victim_current_weapon_mods,
      victim_weapon_1,
      victim_weapon_1_mods,
      victim_weapon_2,
      victim_weapon_2_mods,
      victim_weapon_3,
      victim_weapon_3_mods,
      victim_offhand_weapon_1,
      victim_offhand_weapon_2,
      cause_of_death,
      distance
    } = req.body
    if (!req.params.serverId) {
      res.status(500).send('serverId cannot be undefined')
      return
    }
    CreateKillRecord({
      killstat_version,
      server: Number(req.params.serverId),
      match_id,
      game_mode,
      map,
      game_time,
      player_count,
      attacker_name,
      attacker_id,
      attacker_current_weapon,
      attacker_current_weapon_mods,
      attacker_weapon_1,
      attacker_weapon_1_mods,
      attacker_weapon_2,
      attacker_weapon_2_mods,
      attacker_weapon_3,
      attacker_weapon_3_mods,
      attacker_offhand_weapon_1,
      attacker_offhand_weapon_2,
      victim_name,
      victim_id,
      victim_current_weapon,
      victim_current_weapon_mods,
      victim_weapon_1,
      victim_weapon_1_mods,
      victim_weapon_2,
      victim_weapon_2_mods,
      victim_weapon_3,
      victim_weapon_3_mods,
      victim_offhand_weapon_1,
      victim_offhand_weapon_2,
      cause_of_death,
      distance
    })
      .then((e) => {
        res.sendStatus(201)
        console.log(
          `[${Date.now().toLocaleString()}] Kill submitted for server ${
            req.params.serverId
          }, ${attacker_name} killed ${victim_name}`
        )
      })
      .catch((e) => {
        res.sendStatus(500)
        console.log({
          killstat_version,
          server: Number(req.params.serverId),
          match_id,
          game_mode,
          map,
          game_time,
          player_count,
          attacker_name,
          attacker_id,
          attacker_current_weapon,
          attacker_current_weapon_mods,
          attacker_weapon_1,
          attacker_weapon_1_mods,
          attacker_weapon_2,
          attacker_weapon_2_mods,
          attacker_weapon_3,
          attacker_weapon_3_mods,
          attacker_offhand_weapon_1,
          attacker_offhand_weapon_2,
          victim_name,
          victim_id,
          victim_current_weapon,
          victim_current_weapon_mods,
          victim_weapon_1,
          victim_weapon_1_mods,
          victim_weapon_2,
          victim_weapon_2_mods,
          victim_weapon_3,
          victim_weapon_3_mods,
          victim_offhand_weapon_1,
          victim_offhand_weapon_2,
          cause_of_death,
          distance
        })
        console.error(e)
      })
  }
)
export default router
