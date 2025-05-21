import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: "#2563EB", // Blue-600
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			blue: {
  				50: "#EFF6FF",
  				100: "#DBEAFE",
  				200: "#BFDBFE",
  				300: "#93C5FD",
  				400: "#60A5FA",
  				500: "#3B82F6",
  				600: "#2563EB",
  				700: "#1D4ED8",
  				800: "#1E40AF",
  				900: "#1E3A8A",
  				950: "#172554",
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			"fade-in": {
  				from: { opacity: "0" },
  				to: { opacity: "1" },
  			},
  			"fade-out": {
  				from: { opacity: "1" },
  				to: { opacity: "0" },
  			},
  			"slide-up": {
  				from: { transform: "translateY(10px)", opacity: "0" },
  				to: { transform: "translateY(0)", opacity: "1" },
  			},
  			"slide-down": {
  				from: { transform: "translateY(-10px)", opacity: "0" },
  				to: { transform: "translateY(0)", opacity: "1" },
  			},
  			gradient: {
  				'0%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  				'100%': { backgroundPosition: '0% 50%' },
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-20px)' },
  			},
  			'float-slow': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			grid: {
  				'0%': { transform: 'translateY(0)' },
  				'100%': { transform: 'translateY(100px)' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			"fade-in": "fade-in 0.3s ease-out",
  			"fade-out": "fade-out 0.3s ease-out",
  			"slide-up": "slide-up 0.4s ease-out",
  			"slide-down": "slide-down 0.4s ease-out",
  			gradient: 'gradient 15s ease infinite',
  			float: 'float 6s ease-in-out infinite',
  			'float-slow': 'float-slow 8s ease-in-out infinite',
  			grid: 'grid 20s linear infinite',
  		},
  		backgroundImage: {
  			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
  			"hero-pattern":
  				'linear-gradient(to right bottom, rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.8)), url("/hero-bg-pattern.png")',
  			"blue-gradient": "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
  		},
  		boxShadow: {
  			premium: "0 10px 25px -3px rgba(37, 99, 235, 0.15)",
  			"card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  			"blue-glow": "0 0 15px rgba(37, 99, 235, 0.5)",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
