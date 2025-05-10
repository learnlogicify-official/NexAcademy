import { prisma } from '@/lib/prisma';
import { statsQueue } from './config';
import { setCache } from '@/lib/redis/client';

interface StatsJobData {
  folderId?: string;
  includeSubfolders?: boolean;
  requestId: string;
}

// Process statistics calculation jobs
statsQueue.process(async (job) => {
  const { folderId, includeSubfolders, requestId } = job.data as StatsJobData;
  console.log(`Processing statistics job ${job.id} for folder ${folderId || 'all'}`);
  
  try {
    const startTime = Date.now();
    
    // Build the query conditions
    const where: any = {};
    
    if (folderId) {
      if (includeSubfolders) {
        // Get the folder and all subfolders
        const folder = await prisma.folder.findUnique({
          where: { id: folderId },
          select: { 
            id: true,
            subfolders: {
              select: {
                id: true
              }
            }
          }
        });
        
        if (folder) {
          const folderIds = [folderId];
          if (folder.subfolders && folder.subfolders.length > 0) {
            folder.subfolders.forEach(subfolder => {
              folderIds.push(subfolder.id);
            });
          }
          where.folderId = { in: folderIds };
        } else {
          where.folderId = folderId;
        }
      } else {
        where.folderId = folderId;
      }
    }
    
    // Calculate statistics in parallel for better performance
    const [typeStats, statusStats, difficultyStats, totalCount] = await Promise.all([
      // Count by type
      prisma.question.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      
      // Count by status
      prisma.question.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      
      // Count by difficulty
      prisma.question.groupBy({
        by: ['difficulty'],
        where,
        _count: true
      }),
      
      // Get total count
      prisma.question.count({ where })
    ]);
    
    // Calculate additional metrics
    const folderDistribution = await prisma.question.groupBy({
      by: ['folderId'],
      where,
      _count: true
    });
    
    // Get folder names for the distribution
    const folderIds = folderDistribution.map(item => item.folderId).filter(Boolean);
    const folders = folderIds.length > 0 ? await prisma.folder.findMany({
      where: { id: { in: folderIds as string[] } },
      select: { id: true, name: true }
    }) : [];
    
    // Format the results
    const stats = {
      summary: {
        total: totalCount,
        byType: typeStats.reduce((acc, curr) => {
          acc[curr.type] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        
        byStatus: statusStats.reduce((acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        
        byDifficulty: difficultyStats.reduce((acc, curr) => {
          acc[curr.difficulty] = curr._count;
          return acc;
        }, {} as Record<string, number>),
      },
      
      distribution: {
        byFolder: folderDistribution.map(item => ({
          folderId: item.folderId,
          folderName: folders.find(f => f.id === item.folderId)?.name || 'Unknown',
          count: item._count
        }))
      },
      
      meta: {
        calculatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        requestId
      }
    };
    
    // Cache the results
    const cacheKey = `question_stats:${folderId || 'all'}:${includeSubfolders ? 'with_subfolders' : 'no_subfolders'}`;
    await setCache(cacheKey, stats, 3600); // Cache for 1 hour
    
    // Also cache with the requestId for the client to retrieve
    await setCache(`stats_request:${requestId}`, {
      status: 'completed',
      data: stats
    }, 300); // Cache for 5 minutes
    
    console.log(`Statistics calculation completed in ${Date.now() - startTime}ms`);
    
    return stats;
  } catch (error) {
    console.error('Error calculating question statistics:', error);
    
    // Cache the error for the client to retrieve
    await setCache(`stats_request:${requestId}`, {
      status: 'error',
      error: 'Failed to calculate statistics'
    }, 300);
    
    throw error;
  }
});

// Log completed jobs
statsQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
});

// Log failed jobs
statsQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error: ${error.message}`);
});

export default statsQueue;