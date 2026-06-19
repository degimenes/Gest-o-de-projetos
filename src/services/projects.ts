import pb from '@/lib/pocketbase/client'

export const getProjects = () => pb.collection('projects').getFullList({ sort: '-updated' })
export const updateProject = (id: string, data: any) => pb.collection('projects').update(id, data)
export const syncOdooProjects = () => pb.send('/backend/v1/sync-odoo', { method: 'POST' })
