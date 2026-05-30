import type { Meta, StoryObj } from '@storybook/react'
import { Stat } from './Stat'

const meta: Meta<typeof Stat> = {
  title: 'UI/Stat',
  component: Stat,
  args: { value: 1800, label: 'ккал' },
}
export default meta
type Story = StoryObj<typeof Stat>

export const Default: Story = {}
export const Boxed: Story = { args: { boxed: true } }
export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: 8 }}>
      <Stat boxed value={1800} label="ккал" />
      <Stat boxed value={90} label="белки, г" />
      <Stat boxed value={50} label="жиры, г" />
      <Stat boxed value={225} label="углеводы, г" />
    </div>
  ),
}
