import pb from '@/lib/pocketbase/client'

export const getProjects = () => pb.collection('projects').getFullList()
export const updateProject = (id: string, data: any) => pb.collection('projects').update(id, data)
