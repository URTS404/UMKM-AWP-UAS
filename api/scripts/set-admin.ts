import dotenv from 'dotenv'
import { pool } from '../config/database.js'
import { hashPassword } from '../utils/auth.js'

dotenv.config()

function getArg(name: string): string | undefined {
  const idx = process.argv.findIndex(a => a === `--${name}`)
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1]
  return undefined
}

async function run() {
  const email = getArg('email')
  const password = getArg('password')
  const name = getArg('name') || 'Admin User'

  if (!email || !password) {
    console.error('Missing --email or --password')
    process.exit(1)
  }

  const passwordHash = await hashPassword(password)

  const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  const exists = Array.isArray(users) && users.length > 0

  if (exists) {
    await pool.execute('UPDATE users SET password_hash = ?, name = ?, role = ? WHERE email = ?', [passwordHash, name, 'admin', email])
    console.log('Admin updated')
  } else {
    await pool.execute('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)', [email, passwordHash, name, 'admin'])
    console.log('Admin created')
  }

  process.exit(0)
}

run()
