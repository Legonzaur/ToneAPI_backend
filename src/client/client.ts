import { Router } from 'express'
import { param, query } from 'express-validator'
import { validateErrors } from '../common'
import { allData } from '../process/process'
import { getHostList } from '../db/db'

const router = Router()
//timeout middleware ?
router.get('/*', (req, res, next) => {
  next()
})

function filters(e: any, query: any) {
  return (
    (query.player ? query.player == e.attacker_id : true) &&
    (query.server ? query.server == e.servername : true) &&
    (query.host ? Number(query.host) == e.host : true) &&
    (query.map ? query.map == e.map : true) &&
    (query.weapon ? query.weapon == e.cause_of_death : true) &&
    (query.gamemode ? query.gamemode == e.game_mode : true)
  )
}

router.get('/hosts',
  async (req, res) => {
    const result = (await getHostList())
    const data: { [key: number]: string } = {}
    result.forEach(e => data[Number(e.id)] = e.name)
    res.status(200).send(data)
  })

router.get(
  '/:dataType',
  param('dataType')
    .custom(
      (e) => e == 'weapons' || e == 'players' || e == 'maps' || e == 'servers' || e == 'gamemodes'
    )
    .withMessage('Only weapons, players, maps or servers are valid paths'),
  query(['player', 'host']).optional().toInt().isInt(),
  query(['server', 'map', 'weapon', 'gamemode']).optional().isString(),
  validateErrors,
  (req, res) => {
    const data: {
      [key: string]: {
        deaths: number
        kills: number
        max_distance: number
        total_distance: number
        username?: string
        host?: number
        deaths_while_equipped?: number
      }
    } = {}
    let index: 'cause_of_death' | 'attacker_id' | 'map' | 'servername' | 'game_mode'
    switch (req.params.dataType) {
      case 'weapons':
        index = 'cause_of_death'
        break
      case 'players':
        index = 'attacker_id'
        break
      case 'maps':
        index = 'map'
        break
      case 'servers':
        index = 'servername'
        break
      case 'gamemodes':
        index = 'game_mode'
        break
      default:
        return res.status(400).send()
    }
    allData
      .filter((e) => filters(e, req.query))
      .forEach((e) => {
        if (!e.cause_of_death || !e.attacker_id || !e.map || !e.servername || !e.game_mode) return
        const requestIndex = e[index]
        if (!requestIndex) return
        if (!data[requestIndex])
          data[requestIndex] = {
            deaths: 0,
            kills: 0,
            max_distance: 0,
            total_distance: 0
          }
        if (index === 'attacker_id') data[requestIndex].username = e.attacker_name
        if (index === 'servername') data[requestIndex].host = e.host
        if (index === 'cause_of_death') data[requestIndex].deaths_while_equipped = Number(e.deaths_with_weapon)
        data[requestIndex].deaths += Number(e.deaths)
        data[requestIndex].kills += Number(e.kills)
        data[requestIndex].total_distance += Number(e.total_distance)
        data[requestIndex].max_distance = Math.max(
          data[requestIndex].max_distance,
          Number(e.max_distance)
        )
      })
    res.status(200).send(data)
  }
)

export default router
