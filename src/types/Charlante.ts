export interface Charlante {
  id: string;
  name: string;
  job: string;
  photo: string;
  social?: SocialNetwork[];
}

interface SocialNetwork {
  id: "twitter" | "instagram" | "linkedin" | "github" | "discord" | "web";
  username: string;
}
