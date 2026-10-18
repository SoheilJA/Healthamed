import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DirectionProvider } from '@radix-ui/react-direction'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { router } from '@/routes/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider dir="rtl">
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            <RouterProvider router={router} />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </DirectionProvider>
    </QueryClientProvider>
  )
}
