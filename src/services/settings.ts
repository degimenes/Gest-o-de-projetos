import pb from '@/lib/pocketbase/client'

export const getSettings = async () => {
  try {
    const records = await pb.collection('settings').getFullList()
    return records[0] || null
  } catch {
    return null
  }
}

export const updateSettings = (id: string, data: any) => pb.collection('settings').update(id, data)
