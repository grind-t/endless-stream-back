import 'dotenv/config'
process.env.PLATFORM = 'local'
process.env.NODE_ENV = 'development'

import { startServer } from '../server.js'
import { rl } from '../cli.js'

await startServer()
rl.prompt()
