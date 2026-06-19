import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getOdooProjects } from '@/services/odoo'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectCombobox({
  value,
  onChange,
  managerFilter = '',
}: {
  value: string
  onChange: (code: string) => void
  managerFilter?: string
}) {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    getOdooProjects()
      .then((res) => {
        if (!mounted) return
        const data = Array.isArray(res) ? res : res.projects || res.items || res.data || []
        setProjects(data)
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError('Erro ao carregar projetos do Odoo.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filteredProjects = projects.filter((p) => {
    if (!managerFilter) return true
    const mName = p.user_id ? p.user_id[1] : p.manager_id ? p.manager_id[1] : ''
    return mName?.toLowerCase().includes(managerFilter.toLowerCase())
  })

  const selectedProject = filteredProjects.find((project) => project.id?.toString() === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {loading
              ? 'Carregando projetos...'
              : error
                ? 'Erro ao carregar projetos'
                : selectedProject
                  ? `${selectedProject.name} - ${selectedProject.code || selectedProject.id}`
                  : 'Selecione um projeto Odoo...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por código ou nome do projeto..." />
          <CommandList>
            {loading && (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            )}
            {!loading && error && (
              <div className="p-4 text-sm text-red-500 flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            {!loading && !error && filteredProjects.length === 0 && (
              <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
            )}
            <CommandGroup>
              {!loading &&
                !error &&
                filteredProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`${project.name} ${project.code || ''} ${project.id}`}
                    onSelect={() => {
                      onChange(project.id.toString())
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 flex-shrink-0',
                        value === project.id?.toString() ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">
                      {project.name} - {project.code || project.id}
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
