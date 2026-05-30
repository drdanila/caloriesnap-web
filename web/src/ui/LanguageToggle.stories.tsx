import type { Meta, StoryObj } from '@storybook/react'
import { LanguageToggle } from './LanguageToggle'

const meta: Meta<typeof LanguageToggle> = {
  title: 'UI/LanguageToggle',
  component: LanguageToggle,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof LanguageToggle>

export const OnHeader: Story = {
  render: () => (
    <div
      style={{
        display: 'inline-flex',
        padding: 12,
        borderRadius: 16,
        background: 'var(--grad-mint)',
      }}
    >
      <LanguageToggle />
    </div>
  ),
}
