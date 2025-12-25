export enum Stance {
  COALITION = 'COALITION',
  OPPOSITION = 'OPPOSITION',
}

export interface UserStats {
  debatesCount: number;
  rating: number;
}

export interface User {
  uid: string;
  fullName: string;
  phoneNumber: string;
  photoURL?: string;
  bio?: string;
  topics?: string[];
  stats: UserStats;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  badge?: string;
}

export interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  selectedStance: Stance | null;
  setStance: (stance: Stance | null) => void;
  currentTopic: Topic | null;
  setCurrentTopic: (topic: Topic) => void;
  loadingAuth: boolean;
}