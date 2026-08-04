const FREE_LIMIT = 3
const SUBSCRIPTION_KEY = 'doghealthy_has_subscription'
const PENDING_ACTION_KEY = 'doghealthy_pending_action'
const CHECKOUT_CTX_KEY = 'doghealthy_checkout_ctx'

export type PlanLimitResource =
  | 'dogs'
  | 'medications'
  | 'vaccinations'
  | 'appointments'
  | 'health-records'
  | 'vets'
  | 'nfc-tag'

export type PendingAction = {
  action: 'createTag'
  petId: string
  createdAt: number
}

export type CheckoutContext = {
  next?: string
  pending?: PendingAction | null
  reason?: string
  savedAt?: number
}

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

/** Merge query params into a path string like `/dogs/x/vaccinations?add=1`. */
export const withQueryParams = (path: string, params: Record<string, string>) => {
  const qIndex = path.indexOf('?')
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path
  const search = qIndex >= 0 ? path.slice(qIndex + 1) : ''
  const sp = new URLSearchParams(search)
  for (const [key, value] of Object.entries(params)) {
    if (value === '') sp.delete(key)
    else sp.set(key, value)
  }
  const q = sp.toString()
  return q ? `${pathname}?${q}` : pathname
}

export const usePlanLimits = () => {
  const router = useRouter()
  const route = useRoute()
  const supabase = useSupabase()
  const authStore = useAuthStore()

  const hasSubscriptionLocal = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SUBSCRIPTION_KEY) === 'true'
  }

  const hasSubscription = () => hasSubscriptionLocal()

  const markSubscribed = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBSCRIPTION_KEY, 'true')
    }
  }

  const clearSubscribedFlag = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SUBSCRIPTION_KEY)
    }
  }

  const setPendingAction = (action: PendingAction) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action))
    }
  }

  const peekPendingAction = (): PendingAction | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = sessionStorage.getItem(PENDING_ACTION_KEY)
      if (!raw) return null
      return JSON.parse(raw) as PendingAction
    } catch {
      return null
    }
  }

  const consumePendingAction = (): PendingAction | null => {
    const action = peekPendingAction()
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(PENDING_ACTION_KEY)
    }
    return action
  }

  const saveCheckoutContext = (ctx: CheckoutContext) => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(
      CHECKOUT_CTX_KEY,
      JSON.stringify({ ...ctx, savedAt: Date.now() })
    )
  }

  const readCheckoutContext = (): CheckoutContext => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = sessionStorage.getItem(CHECKOUT_CTX_KEY)
      return raw ? (JSON.parse(raw) as CheckoutContext) : {}
    } catch {
      return {}
    }
  }

  const clearCheckoutContext = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CHECKOUT_CTX_KEY)
    }
  }

  /**
   * After Stripe return: open the add modal (or similar) and strip resume query params.
   */
  const resumeAddUi = async (open: () => void) => {
    if (route.query.add !== '1' && route.query.subscription !== 'success') {
      return false
    }
    markSubscribed()
    open()
    const q = { ...route.query } as Record<string, any>
    delete q.add
    delete q.subscription
    await router.replace({ path: route.path, query: q })
    return true
  }

  /**
   * Prefer live DB status from Stripe webhook fields; fall back to local flag
   * only when the DB row cannot be read (network/RLS), not when status is empty.
   */
  const checkSubscription = async (): Promise<boolean> => {
    try {
      await waitForAuthIfNeeded()
      const userId = authStore.userId
      if (!userId) return false

      const { data, error } = await supabase
        .from('doghealthy_users')
        .select('subscription_status, subscription_current_period_end')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        return hasSubscriptionLocal()
      }

      if (!data) {
        clearSubscribedFlag()
        return false
      }

      const status = String(data.subscription_status || '').toLowerCase()
      const periodEnd = data.subscription_current_period_end
        ? new Date(data.subscription_current_period_end)
        : null
      const periodOk = !periodEnd || periodEnd.getTime() > Date.now() - 24 * 60 * 60 * 1000

      if (ACTIVE_STATUSES.has(status) && periodOk) {
        markSubscribed()
        return true
      }

      clearSubscribedFlag()
      return false
    } catch {
      return hasSubscriptionLocal()
    }
  }

  const waitForAuthIfNeeded = async () => {
    if ((authStore as any).loading) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (!(authStore as any).loading) resolve()
          else setTimeout(check, 40)
        }
        check()
      })
    }
  }

  const freeLimit = FREE_LIMIT

  const canCreateMore = (currentCount: number) => {
    if (hasSubscriptionLocal()) return true
    return currentCount < FREE_LIMIT
  }

  const resourceLabel = (resource: PlanLimitResource | string) => {
    switch (resource) {
      case 'dogs':
        return 'dogs'
      case 'medications':
        return 'medications'
      case 'vaccinations':
        return 'vaccinations'
      case 'appointments':
        return 'appointments'
      case 'health-records':
        return 'health records'
      case 'vets':
        return 'veterinarians'
      case 'nfc-tag':
        return 'NFC / QR tags'
      default:
        return 'items'
    }
  }

  /** Build the URL to return to after successful payment. */
  const buildResumeNext = (resource: PlanLimitResource | string, next: string) => {
    if (!next) return ''
    if (resource === 'nfc-tag' || next.includes('createTag=')) {
      return withQueryParams(next, { createTag: '1' })
    }
    if (next.startsWith('/dogs/new') || next === '/dogs/new') {
      return next
    }
    if (resource === 'dogs' && (next === '/dogs' || next.startsWith('/dogs?'))) {
      return '/dogs/new'
    }
    // Record / vet list pages — reopen the add modal after return
    return withQueryParams(next, { add: '1' })
  }

  /**
   * If the user is at/over the free limit and not subscribed,
   * redirect to billing and return false. Otherwise return true.
   */
  const ensureCanCreate = async (
    resource: PlanLimitResource,
    currentCount: number,
    options?: { redirectQuery?: Record<string, string>; next?: string }
  ) => {
    if (await checkSubscription()) return true
    if (canCreateMore(currentCount)) return true

    const current =
      typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
    const rawNext = options?.next || (current.startsWith('/') ? current : '')
    const next = buildResumeNext(resource, rawNext)

    saveCheckoutContext({ next, reason: resource, pending: null })

    await router.push({
      path: '/billing/subscribe',
      query: {
        reason: resource,
        limit: String(FREE_LIMIT),
        ...(next ? { next } : {}),
        ...(options?.redirectQuery || {})
      }
    })
    return false
  }

  /**
   * Require an active DogHealthy Stripe subscription (e.g. NFC/QR tags).
   */
  const ensureSubscribed = async (options: {
    reason: PlanLimitResource | string
    next?: string
    pending?: PendingAction
  }) => {
    if (await checkSubscription()) return true

    if (options.pending) setPendingAction(options.pending)

    const next = buildResumeNext(options.reason, options.next || '')
    saveCheckoutContext({
      next,
      reason: String(options.reason),
      pending: options.pending || null
    })

    await router.push({
      path: '/billing/subscribe',
      query: {
        reason: options.reason,
        ...(next ? { next } : {})
      }
    })
    return false
  }

  return {
    freeLimit,
    hasSubscription,
    checkSubscription,
    markSubscribed,
    clearSubscribedFlag,
    canCreateMore,
    ensureCanCreate,
    ensureSubscribed,
    setPendingAction,
    peekPendingAction,
    consumePendingAction,
    saveCheckoutContext,
    readCheckoutContext,
    clearCheckoutContext,
    resumeAddUi,
    resourceLabel
  }
}
