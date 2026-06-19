import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOdooProjects()
      .then((res) => setProjects(res.projects || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredProjects = projects
    .filter((p) => {
      if (!managerFilter) return true
      const mName = p.user_id ? p.user_id[1] : p.manager_id ? p.manager_id[1] : ''
      return mName?.toLowerCase().includes(managerFilter.toLowerCase())
    })
    .filter((p) => p.code)

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  const selectedProject = filteredProjects.find((project) => project.code === value)

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
            {selectedProject
              ? `[${selectedProject.code}] ${selectedProject.name}`
              : 'Selecione um projeto Odoo...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar por código ou nome do projeto..." />
          <CommandList>
            <CommandEmpty>Sem dados disponíveis.</CommandEmpty>
            <CommandGroup>
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`[${project.code}] ${project.name}`}
                  onSelect={() => {
                    onChange(project.code)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 flex-shrink-0',
                      value === project.code ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">
                    [{project.code}] {project.name}
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
