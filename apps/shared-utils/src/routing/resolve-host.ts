/** Parse host for tenant routing hints (client-side; API is source of truth). */

export type HostRoutingHint = {
  host: string;
  subdomain?: string;
  isPlatformDomain: boolean;
  isOnboardingHost: boolean;
};

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, '');
}

export function parseHostRouting(
  host: string,
  options: {
    platformBaseDomain: string;
    onboardingHosts?: string[];
  },
): HostRoutingHint {
  const normalized = normalizeHost(host);
  const base = normalizeHost(options.platformBaseDomain);
  const onboardingHosts = (options.onboardingHosts ?? []).map(normalizeHost);

  let subdomain: string | undefined;
  if (normalized.endsWith(`.${base}`) && normalized !== base) {
    const sub = normalized.slice(0, -(base.length + 1));
    if (sub && !sub.includes('.')) {
      subdomain = sub;
    }
  }

  return {
    host: normalized,
    subdomain,
    isPlatformDomain: normalized === base || normalized.endsWith(`.${base}`),
    isOnboardingHost: onboardingHosts.includes(normalized),
  };
}
