import { PrismaClient, Prisma } from '@prisma/client'

// This object will store the Prisma Client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getPrismaClient = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          // Add connection limiting parameters to the URL
          url: `${process.env.DATABASE_URL}${
            process.env.DATABASE_URL?.includes('?') ? '&' : '?'
          }connection_limit=3&pool_timeout=10`
        }
      }
    })

    // Add connection error handler
    globalForPrisma.prisma.$on('error', (e) => {
      console.error('Prisma Client error:', e)
    })
  }
  return globalForPrisma.prisma
}

// Export a singleton instance
export const prisma = getPrismaClient()

// Graceful shutdown handler
const cleanup = async () => {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect()
  }
}

// Handle various termination signals
if (process.env.NODE_ENV !== 'production') {
  // In development, handle nodemon restarts
  process.once('SIGUSR2', async () => {
    await cleanup()
    process.kill(process.pid, 'SIGUSR2')
  })
}

// Handle normal termination
process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
process.on('beforeExit', cleanup)

// Handle uncaught errors
process.on('uncaughtException', async (e) => {
  console.error(e)
  await cleanup()
  process.exit(1)
})

process.on('unhandledRejection', async (e) => {
  console.error(e)
  await cleanup()
  process.exit(1)
}) 