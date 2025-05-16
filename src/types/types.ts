export type SupabaseBattlefield = {
  id: string;
  created_at: string;
  channel_id: string;
  store: {
    last_updated: string;
    items: StoreItems[];
  };
};

export type StoreItems = {
  item: SupabaseItem;
  quantity: number;
  price: number;
};

export enum ItemType {
  HELMET = 'helmet',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  JEWEL = 'jewel',
  CONSUMABLE = 'consumable',
  ACCESSORY = 'accessory',
}

export type SupabaseItem = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  effect_data: {
    type: ItemType;
    modifying_stats_values?: Record<CharacterStat, number>;
    hearts_addition?: number;
    duration_days?: number; // Only for consumables
  };
};

export enum CharacterStat {
  VITALITY = 'vitality',
  ATTACK = 'attack',
  DEFENSE = 'defense',
  SPEED = 'speed',
  LUCK = 'luck',
}

export type SupabaseCharacter = {
  id: string;
  created_at: string;
  name: string;
  story: string;
  hearts: number;
  stats: Record<CharacterStat, number>;
  equipment: {
    helmet: SupabaseItem | null;
    armor: SupabaseItem | null;
    weapon: SupabaseItem | null;
    jewel1: SupabaseItem | null;
    jewel2: SupabaseItem | null;
    accessory1: SupabaseItem | null;
    accessory2: SupabaseItem | null;
  };
  inventory: SupabaseItem[];
  is_available: boolean;
  gold: number;
  user_id: string;
};

export type GeneratedCharacterData = {
  name: string;
  story: string;
  stats: Record<CharacterStat, number>;
};
