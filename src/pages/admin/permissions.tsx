// Admin permission matrix (module x admin level).
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/shared/states'
import { adminApi } from '@/services'
import type { AdminLevel } from '@/types'
import { useDocTitle } from '@/hooks'
import { useAuthStore } from '@/stores'
import { getCurrentUser } from '@/services/authService'

const LEVEL_LABELS: Record<AdminLevel, string> = {
  super: 'مدیر ارشد',
  standard: 'مدیر عملیاتی',
  support: 'پشتیبان'
}

const LEVEL_BADGE: Record<AdminLevel, 'default' | 'secondary' | 'muted'> = {
  super: 'default',
  standard: 'secondary',
  support: 'muted'
}

export default function AdminPermissions() {
  useDocTitle('سطوح دسترسی')
  const queryClient = useQueryClient()
  const user = getCurrentUser()
  const isSuper = user?.mobile === '09190000020'
  const [matrix, setMatrix] = useState<Record<string, Record<AdminLevel, boolean>> | null>(null)

  const { data } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => adminApi.getPermissionMatrix()
  })

  const current = matrix ?? data
  const { data: levels } = useQuery({ queryKey: ['admin-levels'], queryFn: () => adminApi.getAdminLevels() })

  const updateMutation = useMutation({
    mutationFn: (input: { module: string; level: AdminLevel; value: boolean }) =>
      adminApi.updatePermission(input.module, input.level, input.value),
    onSuccess: () => {
      toast.success('سطح دسترسی به‌روزرسانی شد')
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })

  const toggle = (module: string, level: AdminLevel, value: boolean) => {
    // optimistic local update
    setMatrix((m) => {
      const base = m ?? data
      if (!base) return m
      return { ...base, [module]: { ...base[module], [level]: value } }
    })
    updateMutation.mutate({ module, level, value })
  }

  if (!current) return null

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="سطوح دسترسی"
        description="تعیین کنید هر سطح مدیریتی به کدام بخش‌ها دسترسی داشته باشد."
        icon={ShieldCheck}
      />

      {!isSuper && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-center gap-2 p-4 text-sm">
            <Lock className="h-4 w-4 text-warning" />
            فقط مدیر ارشد می‌تواند این ماتریس را تغییر دهد. شما در حالت مشاهده هستید.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" />
            ماتریس دسترسی ماژول‌ها
          </CardTitle>
          <CardDescription>
            تغییرات بلافاصله اعمال می‌شود و در گزارش حسابرسی ثبت می‌گردد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ماژول</TableHead>
                {(Object.keys(LEVEL_LABELS) as AdminLevel[]).map((level) => (
                  <TableHead key={level} className="text-center">
                    <Badge variant={LEVEL_BADGE[level]}>{LEVEL_LABELS[level]}</Badge>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(current).map(([module, perms]) => (
                <TableRow key={module}>
                  <TableCell className="font-medium">{module}</TableCell>
                  {(Object.keys(LEVEL_LABELS) as AdminLevel[]).map((level) => (
                    <TableCell key={level} className="text-center">
                      <Switch
                        checked={perms[level]}
                        disabled={!isSuper || updateMutation.isPending}
                        onCheckedChange={(v) => toggle(module, level, v)}
                        aria-label={`${module} - ${LEVEL_LABELS[level]}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {levels && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توضیح سطوح</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {levels.map((l) => (
              <div key={l.level} className="flex items-start gap-3 rounded-xl border p-3">
                <Badge variant={LEVEL_BADGE[l.level]}>{LEVEL_LABELS[l.level]}</Badge>
                <p className="text-sm text-muted-foreground">{l.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-xs leading-6 text-muted-foreground">
        کاربر مدیر فعلی شما: {user?.fullName} — {useAuthStore.getState().userId ? 'نشست فعال' : ''}
      </p>
    </div>
  )
}
