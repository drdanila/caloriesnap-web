import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'
import { ProgressRing } from './ProgressRing'

const meta: Meta = {
  title: 'UI/Progress',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Bars: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}>
      <ProgressBar value={0.3} />
      <ProgressBar value={0.7} />
      <ProgressBar value={1} />
      <ProgressBar value={1} exceeded />
    </div>
  ),
}

export const Rings: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <ProgressRing value={0.4} center={36} />
      <ProgressRing value={0.85} center={76} />
      <ProgressRing value={1} exceeded center={92} />
    </div>
  ),
}
