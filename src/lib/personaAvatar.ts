import { createAvatar } from '@dicebear/core'
import { personas } from '@dicebear/collection'

// ── Hair pools by presentation ───────────────────────────────────────────────

const FEMININE_HAIR = [
  'long', 'bobCut', 'pigtails', 'curlyBun', 'bobBangs',
  'bunUndercut', 'straightBun', 'extraLong', 'curly',
]

const MASCULINE_HAIR = [
  'shortCombover', 'curlyHighTop', 'buzzcut', 'bald', 'balding',
  'cap', 'fade', 'beanie', 'shortComboverChops', 'mohawk', 'sideShave',
]

const NEUTRAL_HAIR = [
  'shortCombover', 'curlyHighTop', 'curly', 'cap', 'beanie',
  'mohawk', 'sideShave', 'bobCut', 'curlyBun',
]

// ── Name-based gender inference ──────────────────────────────────────────────
// Covers the most common feminine name endings and a focused list of common
// feminine first names. Conservative — unknown names fall through to neutral.

const FEMININE_ENDINGS = [
  'a', 'ia', 'ie', 'ina', 'ine', 'elle', 'elle', 'ette',
  'ise', 'ise', 'ine', 'lyn', 'lynn', 'lee', 'leigh',
]

const FEMININE_NAMES = new Set([
  'sofia', 'sophia', 'emma', 'olivia', 'ava', 'isabella', 'mia', 'amelia',
  'emily', 'abigail', 'harper', 'evelyn', 'elizabeth', 'camila', 'luna',
  'penelope', 'riley', 'zoey', 'nora', 'lily', 'eleanor', 'hannah',
  'lillian', 'addison', 'aubrey', 'ellie', 'stella', 'natalie', 'zoe',
  'leah', 'hazel', 'violet', 'aurora', 'savannah', 'audrey', 'brooklyn',
  'bella', 'claire', 'skylar', 'lucy', 'paisley', 'everly', 'anna',
  'caroline', 'genesis', 'kennedy', 'victoria', 'grace', 'naomi', 'alice',
  'aaliyah', 'sarah', 'priya', 'fatima', 'aisha', 'maria', 'elena',
  'nina', 'diana', 'laura', 'sandra', 'rachel', 'rebecca', 'jessica',
  'jennifer', 'ashley', 'amanda', 'melissa', 'stephanie', 'megan', 'nicole',
  'katherine', 'catherine', 'patricia', 'margaret', 'barbara', 'linda',
  'susan', 'dorothy', 'betty', 'helen', 'ruth', 'sharon', 'karen',
  'lisa', 'nancy', 'betty', 'carol', 'janet', 'virginia', 'judith',
  'angela', 'ann', 'alice', 'jean', 'cheryl', 'martha', 'andrea',
  'frances', 'heather', 'amy', 'julie', 'joyce', 'evelyn', 'sara',
  'marilyn', 'mae', 'joan', 'diane', 'tina', 'brenda', 'donna',
  'cynthia', 'phyllis', 'annie', 'gloria', 'tammy', 'gail', 'beverly',
  'denise', 'kimberly', 'lori', 'michelle', 'wendy', 'kristen', 'amber',
  'crystal', 'stacey', 'lorraine', 'claudia', 'carla', 'rosa', 'wendy',
  'brigitte', 'ingrid', 'helene', 'astrid', 'freya', 'hilde',
  'mei', 'lin', 'ling', 'yan', 'hui', 'xiu', 'fang', 'fen',
  'yuki', 'hana', 'sakura', 'akiko', 'yoko', 'keiko', 'noriko',
  'fatou', 'aminata', 'kadiatou', 'mariama',
  'reyes', // Sofia Reyes case
])

const MASCULINE_NAMES = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard',
  'joseph', 'thomas', 'charles', 'christopher', 'daniel', 'matthew',
  'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua',
  'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald', 'edward',
  'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric',
  'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon',
  'benjamin', 'samuel', 'raymond', 'frank', 'gregory', 'alexander',
  'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose',
  'adam', 'henry', 'douglas', 'nathan', 'peter', 'kyle', 'noah',
  'ethan', 'mason', 'liam', 'logan', 'lucas', 'oliver', 'aiden',
  'elijah', 'jackson', 'sebastian', 'mateo', 'jack', 'owen', 'theo',
  'leo', 'xavier', 'luke', 'caleb', 'julian', 'isaac', 'carlos',
  'miguel', 'antonio', 'juan', 'luis', 'omar', 'ali', 'hassan',
  'ahmed', 'muhammad', 'yusuf', 'ibrahim', 'kwame', 'kofi', 'obafemi',
  'raj', 'rahul', 'arjun', 'vikram', 'suresh', 'ramesh', 'deepak',
  'wei', 'ming', 'jun', 'lei', 'bin', 'peng', 'hao',
  'hiroshi', 'takeshi', 'kenji', 'daisuke', 'yuto', 'sota',
  'marcus', 'luca', 'stefan', 'ivan', 'aleksandr', 'andrei',
])

type GenderPresentation = 'feminine' | 'masculine' | 'neutral'

function inferGender(fullName: string): GenderPresentation {
  const parts = fullName.toLowerCase().trim().split(/\s+/)
  const firstName = parts[0]

  if (FEMININE_NAMES.has(firstName)) return 'feminine'
  if (MASCULINE_NAMES.has(firstName)) return 'masculine'

  // Ending heuristics on first name
  for (const ending of FEMININE_ENDINGS) {
    if (firstName.endsWith(ending) && firstName.length > ending.length + 1) {
      return 'feminine'
    }
  }

  return 'neutral'
}

/**
 * Returns a deterministic DiceBear "Personas" SVG data-URL.
 * Gender presentation is inferred from the persona's name so the illustration
 * is consistent with the character. Pass the persona's full name.
 */
export function personaAvatarSvg(id: string, name?: string): string {
  const gender = name ? inferGender(name) : 'neutral'

  const hairPool =
    gender === 'feminine' ? FEMININE_HAIR
    : gender === 'masculine' ? MASCULINE_HAIR
    : NEUTRAL_HAIR

  const avatar = createAvatar(personas, {
    seed: id,
    size: 80,
    backgroundColor: ['transparent'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hair: hairPool as any,
    facialHairProbability: gender === 'feminine' ? 0 : undefined,
  })

  return avatar.toDataUri()
}
