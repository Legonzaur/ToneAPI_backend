import { sql, type Kysely } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema.createSchema('ToneAPI').ifNotExists().execute()

  await db.schema.createTable('ToneAPI.host')
    .addColumn('host_name', 'varchar(50)', (col) => col.notNull())
    .addColumn('host_id', 'integer', (col) => col.notNull().primaryKey().autoIncrement())
    .addColumn('host_token', 'varchar(50)', (col) => col.notNull().defaultTo(sql`gen_random_uuid()`))
    .execute()

  await db.schema.createTable('ToneAPI.server')
    .addColumn('server_name', 'varchar(64)', (col) => col.notNull())
    .addColumn('host_id', 'integer', (col) => col.notNull().references('ToneAPI.host.host_id'))
    .addPrimaryKeyConstraint('server_pkey', ['server_name', 'host_id'])
    .execute()

  await db.schema.createTable('ToneAPI.match')
    .addColumn('match_id', 'integer', (col) => col.notNull().primaryKey().autoIncrement())
    .addColumn('host_id', 'integer', (col) => col.notNull().primaryKey())
    .addColumn('server_name', 'varchar(64)', (col) => col.notNull())
    .addColumn('game_map', 'varchar(30)', (col) => col.notNull())
    .addColumn('gamemode', 'varchar(10)', (col) => col.notNull())
    .addColumn('air_accel', 'boolean', (col) => col.notNull().defaultTo(false))
    .addForeignKeyConstraint('fk_match_host_of_server', ['host_id', 'server_name'], 'ToneAPI.server', ['host_id', 'server_name'])
    .execute()

  await db.schema.createTable('ToneAPI.player')
    .addColumn('player_id', 'bigint', (col) => col.notNull().primaryKey())
    .addColumn('player_name', 'varchar(50)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('ToneAPI.weapon')
    .addColumn('weapon_id', 'varchar(50)', (col) => col.notNull().primaryKey())
    .addColumn('weapon_name', 'varchar(50)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('ToneAPI.mods_on_weapon')
    .addColumn('mod_id', 'integer', (col) => col.notNull().primaryKey())
    .addColumn('speedloader', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('extra_ammo', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('gunrunner', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('gun_ready', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('quickswap', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('tactikill', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('suppressor', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('ricochet', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('pro_screen', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema.createTable('ToneAPI.titan_chassis')
    .addColumn('titan_id', 'varchar(30)', (col) => col.notNull().primaryKey())
    .addColumn('chassis_name', 'varchar(30)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('ToneAPI.loadout')
    .addColumn('loadout_id', 'integer', (col) => col.notNull().primaryKey().autoIncrement())
    .addColumn('primary_weapon', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('primary_mod_id', 'integer', (col) => col.references('ToneAPI.mods_on_weapon.mod_id'))
    .addColumn('secondary_weapon', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('secondary_mod_id', 'integer', (col) => col.references('ToneAPI.mods_on_weapon.mod_id'))
    .addColumn('anti_titan_weapon', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('anti_titan_mod_id', 'integer', (col) => col.references('ToneAPI.mods_on_weapon.mod_id'))
    .addColumn('ordnance', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('tactical', 'varchar(50)')
    .addColumn('titan_weapon', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('pilot_passive_1', 'varchar(50)')
    .addColumn('pilot_passive_2', 'varchar(50)')
    .addColumn('titan_passive_1', 'varchar(50)')
    .addColumn('titan_passive_2', 'varchar(50)')
    .addColumn('titan_passive_3', 'varchar(50)')
    .addColumn('titan_passive_4', 'varchar(50)')
    .addColumn('titan_passive_5', 'varchar(50)')
    .addColumn('titan_passive_6', 'varchar(50)')
    .addColumn('titan_special', 'varchar(50)')
    .addColumn('titan_anti_rodeo', 'varchar(50)')
    .addColumn('titan_primary_mod', 'varchar(50)')
    .addColumn('titan_id', 'varchar(50)', (col) => col.references('ToneAPI.titan_chassis.titan_id'))
    .execute()

  await db.schema.createTable('ToneAPI.kill')
    .addColumn('kill_id', 'bigint', (col) => col.notNull().primaryKey().autoIncrement())
    .addColumn('attacker_id', 'bigint', (col) => col.notNull().references('ToneAPI.player.player_id'))
    .addColumn('victim_id', 'bigint', (col) => col.notNull().references('ToneAPI.player.player_id'))
    .addColumn('match_id', 'integer', (col) => col.notNull().references('ToneAPI.match.match_id'))
    .addColumn('attacker_loadout_id', 'integer', (col) => col.notNull().references('ToneAPI.loadout.loadout_id'))
    .addColumn('victim_loadout_id', 'integer', (col) => col.notNull().references('ToneAPI.loadout.loadout_id'))
    .addColumn('attacker_speed', 'integer')
    .addColumn('victim_speed', 'integer')
    .addColumn('attacker_movementstate', 'varchar(50)')
    .addColumn('victim_movementstate', 'varchar(50)')
    .addColumn('distance', 'integer')
    .addColumn('unix_time', 'timestamp')
    .addColumn('game_time', 'decimal')
    .addColumn('cause_of_death', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('attacker_held_weapon', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .addColumn('victim_held_weapon', 'varchar(50)', (col) => col.references('ToneAPI.weapon.weapon_id'))
    .execute()

  await db.schema.createTable('ToneAPI.titan_stats_in_match')
    .addColumn('match_id', 'integer', (col) => col.notNull().references('ToneAPI.match.match_id'))
    .addColumn('player_id', 'bigint', (col) => col.notNull().references('ToneAPI.player.player_id'))
    .addColumn('titan_id', 'varchar(50)', (col) => col.notNull().references('ToneAPI.titan_chassis.titan_id'))
    .addColumn('playtime', 'bigint')
    .addColumn('shots_fired', 'integer')
    .addColumn('shots_hit', 'integer')
    .addColumn('headshots', 'integer')
    .addPrimaryKeyConstraint('titan_stats_in_match_pkey', ['match_id', 'player_id', 'titan_id'])
    .execute()

  await db.schema.createTable('ToneAPI.weapon_stats_in_match')
    .addColumn('match_id', 'integer', (col) => col.notNull().references('ToneAPI.match.match_id'))
    .addColumn('player_id', 'bigint', (col) => col.notNull().references('ToneAPI.player.player_id'))
    .addColumn('weapon_id', 'varchar(50)', (col) => col.notNull().references('ToneAPI.weapon.weapon_id'))
    .addColumn('playtime', 'bigint')
    .addColumn('shots_fired', 'integer')
    .addColumn('shots_hit', 'integer')
    .addColumn('headshots', 'integer')
    .addColumn('ricochets', 'integer')
    .addPrimaryKeyConstraint('weapon_stats_in_match_pkey', ['match_id', 'player_id', 'weapon_id'])
    .execute()

  await db.schema.createTable('ToneAPI.player_stats_in_match')
    .addColumn('match_id', 'integer', (col) => col.notNull().references('ToneAPI.match.match_id'))
    .addColumn('player_id', 'bigint', (col) => col.notNull().references('ToneAPI.player.player_id'))
    .addColumn('shots_fired', 'integer')
    .addColumn('shots_hit', 'integer')
    .addColumn('headshots', 'integer')
    .addColumn('ricochets', 'integer')
    .addColumn('overall_distance_covered', 'bigint')
    .addColumn('time_grounded', 'bigint')
    .addColumn('time_wall', 'bigint')
    .addColumn('time_air', 'bigint')
    .addPrimaryKeyConstraint('playerstats_in_match_pkey', ['match_id', 'player_id'])
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {

}