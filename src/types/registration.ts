export interface MemberRegistration {
  name: string
  generation: number
  invitationCode: string
}

export interface RegisteredMember {
  name: string
  generation: number
}

export type RegisterMember = (input: MemberRegistration) => Promise<RegisteredMember>
export class RegistrationError extends Error {
  readonly reason: 'invitation' | 'unavailable'
  constructor(reason: 'invitation' | 'unavailable') { super(reason); this.reason = reason }
}
