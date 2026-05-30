import type { Meta, StoryObj } from '@storybook/react'
import { LanguageToggle } from './LanguageToggle'

const meta: Meta<typeof LanguageToggle> = {
  title: 'UI/LanguageToggle',
  component: LanguageToggle,
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof LanguageToggle>

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <LanguageToggle />
    </div>
  ),
}
