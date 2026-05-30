import type { Preview } from '@storybook/react'
import { I18nProvider } from '../src/i18n/I18nProvider'
import '../src/styles/tokens.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#f4f7f5' },
        { name: 'surface', value: '#ffffff' },
        { name: 'mint', value: '#a8d5ba' },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
}

export default preview
