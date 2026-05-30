import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  args: { emoji: '📸', title: 'Пока нет записей', subtitle: 'Начните с фото вашего блюда' },
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {}
export const WithAction: Story = {
  args: { action: <Button size="sm">Сделать фото</Button> },
}
