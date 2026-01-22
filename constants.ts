
import { ThemeOption } from './types';

export const THEMES: ThemeOption[] = [
  { 
    id: 'cyberpunk', 
    label: 'Cyberpunk City', 
    promptPrefix: 'A futuristic cyberpunk city at night with neon signs, rain, and holographic displays, cinematic lighting, 8k resolution.',
    color: 'from-purple-600 to-blue-500'
  },
  { 
    id: 'enchanted_forest', 
    label: 'Enchanted Forest', 
    promptPrefix: 'A magical enchanted forest with glowing mushrooms, ethereal spirits, and ancient trees, vibrant fantasy art style.',
    color: 'from-green-600 to-emerald-400'
  },
  { 
    id: 'space_odyssey', 
    label: 'Space Odyssey', 
    promptPrefix: 'A nebula in deep space with futuristic space stations and planets, cosmic colors, epic scale.',
    color: 'from-blue-700 to-indigo-900'
  },
  { 
    id: 'underwater', 
    label: 'Sunken Atlantis', 
    promptPrefix: 'The ruins of Atlantis underwater with bioluminescent sea life and majestic coral reefs, crystal clear water.',
    color: 'from-cyan-600 to-blue-400'
  }
];

export const DIFFICULTY_CONFIG = {
  easy: { size: 3, label: '3x3 (Easy)' },
  medium: { size: 4, label: '4x4 (Normal)' },
  hard: { size: 5, label: '5x5 (Hard)' }
};
