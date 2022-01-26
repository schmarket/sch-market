const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors')

module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {
			colors: {
				primary: {
					light: colors.gray['100'],
					medium: colors.gray['200'],
					dark: colors.gray['300']
				},
			},
			fontFamily: {
				sans: ['Ubuntu', ...defaultTheme.fontFamily.sans]
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('@tailwindcss/typography'),
	],
};
