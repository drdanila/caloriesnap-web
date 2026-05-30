import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'padded' },
  argTypes: { padding: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { children: 'Калории за сегодня — 1240 / 1800 ккал' },
}
export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {}
export const Interactive: Story = { args: { interactive: true, children: 'Наведи — карточка приподнимается' } }
export const Paddings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      <Card padding="sm">padding sm</Card>
      <Card padding="md">padding md</Card>
      <Card padding="lg">padding lg</Card>
    </div>
  ),
}
