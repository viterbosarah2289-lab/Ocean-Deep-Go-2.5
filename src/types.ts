/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Fish {
  id: string;
  name: string;
  scientific: string;
  color: string;
  description: string;
  isBonus?: boolean;
  svgPath: string; // Dynamic rendering
}

export interface Turtle {
  id: string;
  name: string;
  character: string;
  color: string;
  shellColor: string;
  borderColor: string;
  description: string;
  statSpeed: number;
  statDefense: number;
}

export interface SurpriseCard {
  title: string;
  description: string;
  effect: (position: number) => { newPosition: number; message: string; skipTurn?: boolean; rollAgain?: boolean };
}

export interface BoardSpace {
  id: number;
  label: string;
  type: 'start' | 'safe' | 'treasure' | 'obstacle' | 'surprise' | 'finish';
  x: number; // For rendering map
  y: number;
}

export const MEET_FISH_LIST: Fish[] = [
  {
    id: 'clownfish',
    name: 'Clownfish',
    scientific: 'Amphiprioninae',
    color: 'from-orange-500 to-amber-600',
    description: 'Bright orange with characteristic white stripes outlined in bold black. Famous for living in sea anemones.',
    svgPath: 'clownfish'
  },
  {
    id: 'blue_tang',
    name: 'Blue Tang',
    scientific: 'Paracanthurus hepatus',
    color: 'from-blue-600 to-indigo-800',
    description: 'Striking royal blue body, solid black markings, and a vibrant yellow wedge on its tail fin.',
    svgPath: 'bluetang'
  },
  {
    id: 'angelfish',
    name: 'Angelfish',
    scientific: 'Pterophyllum',
    color: 'from-cyan-400 to-indigo-500',
    description: 'Tall diamond-shaped bodies, long flowing filaments, and majestic stripes of gold and dark sapphire.',
    svgPath: 'angelfish'
  },
  {
    id: 'butterflyfish',
    name: 'Butterflyfish',
    scientific: 'Chaetodontidae',
    color: 'from-yellow-400 to-yellow-600',
    description: 'Bright disk-shaped yellow body, highly intricate black mask markings, and an eyespot to confuse predators.',
    svgPath: 'butterflyfish'
  },
  {
    id: 'lionfish',
    name: 'Lionfish',
    scientific: 'Pterois',
    color: 'from-red-600 to-rose-800',
    description: 'Flamboyant red and white zebra stripes, carrying fan-like pectoral fins with venomous spiky rays.',
    svgPath: 'lionfish'
  }
];

export const BONUS_FISH_LIST: Fish[] = [
  {
    id: 'parrotfish',
    name: 'Parrotfish',
    scientific: 'Scaridae',
    color: 'from-teal-400 to-emerald-500',
    description: 'Extremely colorful turquoise-green body, pink cheeks, and a beak-like jaw used to scrap coral.',
    isBonus: true,
    svgPath: 'parrotfish'
  },
  {
    id: 'moorish_idol',
    name: 'Moorish Idol',
    scientific: 'Zanclus cornutus',
    color: 'from-slate-700 to-slate-900',
    description: 'Distinct steep black, white, and yellow vertical thick bands with an exceptionally tall dorsal streamer.',
    isBonus: true,
    svgPath: 'moorishidol'
  },
  {
    id: 'pufferfish',
    name: 'Pufferfish',
    scientific: 'Tetraodontidae',
    color: 'from-yellow-700 to-amber-800',
    description: 'Sandy bulbous body covered in safe small protective spines. Swells into a perfect sphere when excited.',
    isBonus: true,
    svgPath: 'pufferfish'
  },
  {
    id: 'royal_gramma',
    name: 'Royal Gramma',
    scientific: 'Gramma loreto',
    color: 'from-purple-600 to-fuchsia-500',
    description: 'Perfect horizontal color dip split: electric magenta front half, fading to sunshine golden yellow at back.',
    isBonus: true,
    svgPath: 'royalgramma'
  },
  {
    id: 'triggerfish',
    name: 'Triggerfish',
    scientific: 'Balistidae',
    color: 'from-sky-400 to-cyan-600',
    description: 'Highly geometric body shape, decorated with elegant bright blue line-patterns and strong locking dorsal spine.',
    isBonus: true,
    svgPath: 'triggerfish'
  }
];

export const TURTLE_LIST: Turtle[] = [
  {
    id: 'shelly',
    name: 'Shelly',
    character: 'The Friendly Botanist',
    color: 'bg-emerald-500 text-emerald-950',
    shellColor: '#10b981',
    borderColor: '#047857',
    description: 'Gentle green sea turtle with mossy floral shell. Slow but extremely lucky with finding treasure!',
    statSpeed: 2,
    statDefense: 5
  },
  {
    id: 'turbo',
    name: 'Turbo',
    character: 'The Lightning Glider',
    color: 'bg-cyan-500 text-cyan-950',
    shellColor: '#06b6d4',
    borderColor: '#0e7490',
    description: 'Streamlined ocean racer with electric neon stripes. Moves fast on safe currents!',
    statSpeed: 5,
    statDefense: 2
  },
  {
    id: 'coral',
    name: 'Coral',
    character: 'The Anemone Guardian',
    color: 'bg-rose-500 text-rose-950',
    shellColor: '#f43f5e',
    borderColor: '#be123c',
    description: 'Brave defender of the shallows dressed in anemone pink. Resilient against obstacles!',
    statSpeed: 3,
    statDefense: 4
  },
  {
    id: 'wave',
    name: 'Wave',
    character: 'The Deep Abyss Swimmer',
    color: 'bg-blue-500 text-blue-950',
    shellColor: '#3b82f6',
    borderColor: '#1d4ed8',
    description: 'Wears the cobalt shell of the deep-sea. Unbothered by surprise whirlpools!',
    statSpeed: 4,
    statDefense: 3
  }
];

export const BOARD_PATH: BoardSpace[] = [
  { id: 0, label: 'START', type: 'start', x: 50, y: 50 },
  { id: 1, label: 'Space 1', type: 'safe', x: 180, y: 50 },
  { id: 2, label: 'Space 2', type: 'treasure', x: 310, y: 50 },
  { id: 3, label: 'Space 3', type: 'obstacle', x: 440, y: 50 },
  { id: 4, label: 'Space 4', type: 'surprise', x: 570, y: 50 },
  { id: 5, label: 'Space 5', type: 'safe', x: 700, y: 50 },
  { id: 6, label: 'Space 6', type: 'obstacle', x: 830, y: 50 },
  { id: 7, label: 'Space 7', type: 'treasure', x: 830, y: 190 },
  { id: 8, label: 'Space 8', type: 'safe', x: 700, y: 190 },
  { id: 9, label: 'Space 9', type: 'surprise', x: 570, y: 190 },
  { id: 10, label: 'Space 10', type: 'obstacle', x: 440, y: 190 },
  { id: 11, label: 'Space 11', type: 'treasure', x: 310, y: 190 },
  { id: 12, label: 'Space 12', type: 'safe', x: 180, y: 190 },
  { id: 13, label: 'Space 13', type: 'surprise', x: 180, y: 330 },
  { id: 14, label: 'Space 14', type: 'obstacle', x: 310, y: 330 },
  { id: 15, label: 'Space 15', type: 'treasure', x: 440, y: 330 },
  { id: 16, label: 'Space 16', type: 'safe', x: 570, y: 330 },
  { id: 17, label: 'FINISH', type: 'finish', x: 730, y: 330 }
];

export const SURPRISE_CARDS: Omit<SurpriseCard, 'effect'>[] = [
  {
    title: 'Surfing Whirlpool!',
    description: 'An aggressive oceanic whirlpool pushes your shell forward. Advance 3 spaces!'
  },
  {
    title: 'Thick Seaweed Nest!',
    description: 'You get stuck in coral and plastic net ropes. Lose 1 turn!'
  },
  {
    title: 'Tailwind Tidal wave!',
    description: 'A powerful surge of water hits your shell. Roll the dice again!'
  },
  {
    title: 'Friendly Blue Whale!',
    description: 'A big blue whale lets you carry on its back. Advance 2 spaces!'
  },
  {
    title: 'Hermit Crab Swap!',
    description: 'The shifting currents allow you to switch shells. Swap positions with the player directly behind you (if none, advance 1 space).'
  },
  {
    title: 'Submarine Wake!',
    description: 'A passing vessel pushes you backward in its draft. Retreat 2 spaces.'
  },
  {
    title: 'Jellyfish Swarm!',
    description: 'Shockingly dense! You tuck inside your shell and slip backwards 1 space.'
  }
];
