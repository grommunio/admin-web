export type CustomImageSet = {
  logo?: string;
  logoLight?: string;
  icon?: string;
  background?: string;
  backgroundDark?: string;
}
export type StoredCustomImages = Record<string, CustomImageSet>;