import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import clientMain from '../src/clientMain'
import * as dotenv from 'dotenv'
import db from '../src/db/db'
dotenv.config()

let listenServer

beforeAll(async () => {
    listenServer = await clientMain;
})

describe('client', () => {
    test('server list', async () => {
        const request = await fetch("http://127.0.0.1:3000/servers")
        const data = await request.json()
        const first = Object.entries(data)[0]
        expect(first[1]).toHaveProperty('max_distance')
        expect(first[1]).toHaveProperty('total_distance')
        expect(first[1]).toHaveProperty('kills')
    })

    test('player list', async () => {
        const request = await fetch("http://127.0.0.1:3000/players")
        const data = await request.json()
        const first = Object.entries(data)[0]
        expect(first[1]).toHaveProperty('max_distance')
        expect(first[1]).toHaveProperty('total_distance')
        expect(first[1]).toHaveProperty('kills')
    })

    test('player list with weapon filter', async () => {
        const request = await fetch("http://127.0.0.1:3000/players?weapons=sniper")
        const data = await request.json()
        const first = Object.entries(data)[0]
        expect(first[1]).toHaveProperty('max_distance')
        expect(first[1]).toHaveProperty('total_distance')
        expect(first[1]).toHaveProperty('kills')
    })

    test('weapon list', async () => {
        const request = await fetch("http://127.0.0.1:3000/weapons")
        const data = await request.json()
        const first = Object.entries(data)[0]
        expect(first[1]).toHaveProperty('max_distance')
        expect(first[1]).toHaveProperty('total_distance')
        expect(first[1]).toHaveProperty('kills')
    })

    test('weapon list with player filter', async () => {
        const request = await fetch("http://127.0.0.1:3000/weapons?players=1005930844007")
        const data = await request.json()
        const first = Object.entries(data)[0]
        expect(first[1]).toHaveProperty('max_distance')
        expect(first[1]).toHaveProperty('total_distance')
        expect(first[1]).toHaveProperty('kills')
    })
})

afterAll((done) => {
    listenServer.close(async () => {
        await db.destroy()
        done()
    })
})