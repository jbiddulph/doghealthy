const FREE_LIMIT = 3
const SUBSCRIPTION_KEY = 'doghealthy_has_subscription'
const PENDING_ACTION_KEY = 'doghealthy_pending_action'

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

const ACTIVE_STATUSES = new Set(['active', 'trialing'])

export const usePlanLimits = () => {
  const router = useRouter()
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

  /**
   * Prefer live DB status from Stripe webhook fields; fall back to local flag.
   */
  const checkSubscription = async (): Promise<boolean> => {
    try {
      await waitForAuthIfNeeded()
      const userId = authStore.userId
      if (!userId) return hasSubscriptionLocal()

      const { data, error } = await supabase
        .from('doghealthy_users')
        .select('subscription_status, subscription_current_period_end')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        return hasSubscriptionLocal()
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

      if (['canceled', 'unpaid', 'incomplete_expired', 'paused'].includes(status)) {
        clearSubscribedFlag()
        return false
      }

      // Keep local flag briefly if webhook hasn't landed yet after checkout
      if (hasSubscriptionLocal()) return true

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

  /**
   * Basic accounts can create up to FREE_LIMIT items.
   * Trying to create the (FREE_LIMIT + 1)th item requires a subscription.
   */
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

    const current = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
    const next = options?.next || (current.startsWith('/') ? current : '')

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

    await router.push({
      path: '/billing/subscribe',
      query: {
        reason: options.reason,
        ...(options.next ? { next: options.next } : {})
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
    resourceLabel
  }
}
