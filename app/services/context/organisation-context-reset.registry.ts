type ResetHandler = () => void

const resetHandlers = new Map<string, ResetHandler>()
let revision = 0

export const registerOrganisationContextReset = (key: string, handler: ResetHandler): void => {
    resetHandlers.set(key, handler)
}

export const resetOrganisationContext = (): void => {
    revision += 1
    for (const handler of resetHandlers.values()) handler()
}

export const organisationContextRevision = (): number => {
    return revision
}

export const isOrganisationContextCurrent = (value: number): boolean => {
    return value === revision
}
