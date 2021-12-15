import 'dotenv/config'
import { startServer } from '../server.js'
import { rl } from '../cli.js'

await startServer()
rl.prompt()
