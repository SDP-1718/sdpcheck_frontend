import { RegistrationError } from '../types/registration'
import type { RegisterMember } from '../types/registration'

// UI preview only. Replace with the authenticated registration API when available.
export const previewRegisterMember: RegisterMember = async input => {
  if (input.invitationCode !== 'SDP2026') throw new RegistrationError('invitation')
  return { name: input.name, generation: input.generation }
}
