/* eslint-disable no-unused-vars */
import { ThemeOptions } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";
export type ThemeFactory = (mode: ThemeMode) => ThemeOptions;
export type ColorThemeName =
  | "grommunio"
  | "green"
  | "magenta"
  | "purple"
  | "teal"
  | "orange"
  | "brown"
  | "bluegrey";