"use client";

import {
  AlertsManager,
  createAlertsManager,
  GlobalStyles,
} from "@bigcommerce/big-design";
import { theme as defaultTheme } from "@bigcommerce/big-design-theme";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
export const alertsManager = createAlertsManager(); // import this in child components to use alerts

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyledThemeProvider theme={defaultTheme}>
      <GlobalStyles />
      <AlertsManager manager={alertsManager} />
      {children}
    </StyledThemeProvider>
  );
}
