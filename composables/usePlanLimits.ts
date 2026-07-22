const FREE_LIMIT = 3
const SUBSCRIPTION_KEY = 'doghealthy_has_subscription'

export type PlanLimitResource =
  | 'dogs'
  | 'medications'
  | 'vaccinations'
  | 'appointments'
  | 'health-records'
  | 'vets'

export const usePlanLimits = () => {
  const router = useRouter()

  const hasSubscription = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SUBSCRIPTION_KEY) === 'true'
  }

  const markSubscribed = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBSCRIPTION_KEY, 'true')
    }
  }

  const freeLimit = FREE_LIMIT

  /**
   * Basic accounts can create up to FREE_LIMIT items.
   * Trying to create the (FREE_LIMIT + 1)th item requires a subscription.
   */
  const canCreateMore = (currentCount: number) => {
    if (hasSubscription()) return true
    return currentCount < FREE_LIMIT
  }

  const resourceLabel = (resource: PlanLimitResource) => {
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
    options?: { redirectQuery?: Record<string, string> }
  ) => {
    if (canCreateMore(currentCount)) return true

    await router.push({
      path: '/billing/subscribe',
      query: {
        reason: resource,
        limit: String(FREE_LIMIT),
        ...(options?.redirectQuery || {})
      }
    })
    return false
  }

  return {
    freeLimit,
    hasSubscription,
    markSubscribed,
    canCreateMore,
    ensureCanCreate,
    resourceLabel
  }
}
