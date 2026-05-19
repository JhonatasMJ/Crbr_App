import type { Href } from "expo-router";

export type HeaderProps = {
  span?: string;
  title: string;
  logo?: boolean;
  backHref?: Href;
};