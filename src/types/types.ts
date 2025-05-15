export type SupabaseBattlefield = {
  id: string;
  created_at: string;
  channel_id: string;
  store_items: {
    item: SupabaseItem;
    quantity: number;
    price: number;
  }[];
};

export type SupabaseItem = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  effect_data: {
    type: string;
  };
};

export type SupabaseCharacter = {
  id: string;
  created_at: string;
  name: string;
  story: string;
  hearts: number;
  stats: {
    vitality: number;
    attack: number;
    defense: number;
    speed: number;
    luck: number;
  };
  equipment: {
    helmet: SupabaseItem;
    armor: SupabaseItem;
    weapon: SupabaseItem;
    jewel: SupabaseItem;
  };
  inventory: SupabaseItem[];
  is_available: boolean;
};

export type GeneratedCharacterData = {
  name: string;
  story: string;
  stats: { vitality: number; attack: number; defense: number; speed: number; luck: number };
};
