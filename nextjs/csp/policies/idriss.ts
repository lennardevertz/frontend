import type CspDev from 'csp-dev';

export function idriss(): CspDev.DirectiveDescriptor {
  return {
    'connect-src': [
      'https://polygon.llamarpc.com',
      'https://www.idriss.xyz',
    ],
  };
}
