import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface PaletteOptions {
        custom?: {
            tomato: React.CSSProperties['color'],
        };
    }
}

const dark = '#13293D';
const veronica = '#9147FF';
const lavender = '#CBC5EA';
const gold = '#ffd42a';
const mint = '#61c9a8';
const richBlack = '#01161e';
const brains = '#762866'
export const tomato = '#ff6347';

export const theme = createTheme({
    palette: {
        primary: {
            light: lavender,
            main: veronica,
            dark: dark,
            contrastText: '#fff',
        },
        secondary: {
            light: gold,
            main: mint,
            dark: dark,
            contrastText: '#000',
        },
        background: {
            default: richBlack,
            paper: richBlack
        },
        mode: 'dark',
        // Used by `getContrastText()` to maximize the contrast between
        // the background and the text.
        contrastThreshold: 3,
        // Used by the functions below to shift a color's luminance by approximately
        // two indexes within its tonal palette.
        // E.g., shift from Red 500 to Red 300 or Red 700.
        tonalOffset: 0.2,
    },
    components: {
        // Name of the component
        MuiButton: {
            styleOverrides: {
                // Name of the slot
                root: {
                  // Some CSS
                  "&:hover": {
                    backgroundColor: dark,
                  },
                },
              },
        },
      },
});
