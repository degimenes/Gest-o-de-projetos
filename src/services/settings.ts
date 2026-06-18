import pb from '@/lib/pocketbase/client'

export const getSettings = async () => {
  const records = await pb.collection('settings').getFullList()
  if (records.length > 0) return records[0]
  throw new Error('Settings not found')
}

export const updateSettings = (id: string, data: any) => pb.collection('settings').update(id, data)
