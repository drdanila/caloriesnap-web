import type { Meta, StoryObj } from '@storybook/react'
import { Camera } from 'lucide-react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Сделать фото' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Удалить' } }
export const WithIcon: Story = { args: { leftIcon: <Camera size={18} /> } }
export const Loading: Story = { args: { loading: true } }
export const FullWidth: Story = { args: { fullWidth: true }, parameters: { layout: 'padded' } }

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
      {(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
        <div key={v} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button variant={v} size="sm">Small</Button>
          <Button variant={v} size="md">Medium</Button>
          <Button variant={v} size="lg">Large</Button>
        </div>
      ))}
    </div>
  ),
}
