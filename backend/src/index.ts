import { env } from './config'
import { logger } from './logger'
import app from './app'

app.listen(env.PORT, () => {
  logger.info(`Backend listening on http://localhost:${env.PORT}`)
})