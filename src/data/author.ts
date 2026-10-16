/* Autor de la web: la sección "Autor" y los iconos del footer salen de aquí. */

export const AUTHOR = {
  name: 'Izan',
  // frase de presentación bajo el título de la sección
  bio: 'Me gusta cacharrear con terminales y dejarlas bonitas.',
  links: [
    { id: 'github',    label: 'GitHub',    handle: 'diogenes4134', url: 'https://github.com/diogenes4134' },
    { id: 'instagram', label: 'Instagram', handle: 'izandiazph',   url: 'https://www.instagram.com/izandiazph/' },
  ],
} as const;

export type SocialId = (typeof AUTHOR.links)[number]['id'];
