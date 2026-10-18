type ResetHandler = () => void

const resetHandlers = new Map<string, ResetHandler>()
let revision = 0

export function registerOrganisationContextReset(key: string, handler: ResetHandler): void {
    resetHandlers.set(key, handler)
}

export function resetOrganisationContext(): void {
    revision += 1
    for (const handler of resetHandlers.values()) handler()
}

export function organisationContextRevision(): number {
    return revision
}

export function isOrganisationContextCurrent(value: number): boolean {
    return value === revision
}
