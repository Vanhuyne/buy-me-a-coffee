export interface CreatorProfile {
  address: string;
  name: string;
  bio: string;
  emoji: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  createdAt: number;
}

export interface StoredCreators {
  [address: string]: CreatorProfile;
}
