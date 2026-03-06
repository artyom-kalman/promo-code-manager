import { createTheme, type MantineColorsTuple } from '@mantine/core';

const gold: MantineColorsTuple = [
  '#FDF8EC',
  '#F5E9C8',
  '#EDDAA4',
  '#E5CB80',
  '#DDBC5C',
  '#D4A843',
  '#B8923A',
  '#9C7C31',
  '#806628',
  '#64501F',
];

export const theme = createTheme({
  primaryColor: 'gold',
  colors: { gold },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  headings: {
    fontFamily: 'DM Serif Display, Georgia, serif',
  },
  defaultRadius: 'sm',
  components: {
    Button: {
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Table: {
      styles: {
        table: {
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        overlayProps: { backgroundOpacity: 0.6, blur: 4 },
      },
      styles: {
        header: {
          backgroundColor: 'var(--pcm-bg-surface)',
          borderBottom: '1px solid var(--pcm-border)',
        },
        content: {
          backgroundColor: 'var(--pcm-bg-surface)',
        },
        title: {
          fontFamily: 'DM Serif Display, Georgia, serif',
          fontSize: '1.15rem',
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: 'var(--pcm-bg-surface)',
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: 6,
          marginBottom: 4,
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          backgroundColor: 'var(--pcm-bg-elevated)',
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    PasswordInput: {
      styles: {
        input: {
          backgroundColor: 'var(--pcm-bg-elevated)',
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    NumberInput: {
      styles: {
        input: {
          backgroundColor: 'var(--pcm-bg-elevated)',
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    Select: {
      styles: {
        input: {
          backgroundColor: 'var(--pcm-bg-elevated)',
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    DatePickerInput: {
      styles: {
        input: {
          backgroundColor: 'var(--pcm-bg-elevated)',
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    Pagination: {
      styles: {
        control: {
          borderColor: 'var(--pcm-border)',
        },
      },
    },
    SegmentedControl: {
      styles: {
        root: {
          backgroundColor: 'var(--pcm-bg-elevated)',
        },
      },
    },
  },
});
