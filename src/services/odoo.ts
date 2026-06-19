import pb from '@/lib/pocketbase/client'

export const getOdooProjects = async () => {
  console.log('INICIANDO BUSCA DE PROJETOS')
  return pb.send('/backend/v1/odoo/projects', { method: 'GET' })
}

export const getDiagnostic = async (projectId: string) => {
  return pb.send('/backend/v1/diagnostic', {
    method: 'POST',
    body: JSON.stringify({ code: projectId }),
  })
}
