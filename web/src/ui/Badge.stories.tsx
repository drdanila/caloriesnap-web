import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: '320' },
  argTypes: { tone: { control: 'select', options: ['mint', 'neutral', 'success', 'warning', 'danger'] } },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Mint: Story = { args: { tone: 'mint' } }
export const All: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge tone="mint">🔥 320 ккал</Badge>
      <Badge tone="success">✅ 92%</Badge>
      <Badge tone="warning">⚠️ 70%</Badge>
      <Badge tone="danger">❌ 40%</Badge>
      <Badge tone="neutral">neutral</Badge>
    </div>
  ),
}
