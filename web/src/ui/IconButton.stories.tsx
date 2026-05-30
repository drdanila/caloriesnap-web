import type { Meta, StoryObj } from '@storybook/react'
import { LogOut, Trash2, User } from 'lucide-react'
import { IconButton } from './IconButton'

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  args: { label: 'Action', children: <User size={18} /> },
}
export default meta
type Story = StoryObj<typeof IconButton>

export const Soft: Story = {}
export const Solid: Story = { args: { variant: 'solid' } }
export const Ghost: Story = { args: { variant: 'ghost', children: <Trash2 size={18} /> } }
export const OnAccent: Story = {
  args: { variant: 'onAccent', children: <LogOut size={16} />, size: 'sm' },
  parameters: { backgrounds: { default: 'mint' } },
}
