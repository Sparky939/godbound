/** @type {import('tailwindcss').Config} */
export default {
    content: ['./{module,templates}/**/*.{html,js,hbs}'],
    theme: {
        colors: {
            'list-header': '#444',
        },
        extend: {
            height: {
                'item-header': '28px',
            },
            gridTemplateColumns: {
                tactics: '20px 45px 1fr max-content',
            },
            gridTemplateRows: {
                items: '28px',
            },
        },
    },
    plugins: [],
}
