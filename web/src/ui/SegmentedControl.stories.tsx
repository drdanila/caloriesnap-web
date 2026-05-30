import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const meta: Meta = {
  title: 'UI/SegmentedControl',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Gender: Story = {
  render: () => {
    const [v, setV] = useState<'male' | 'female'>('male')
    return (
      <div style={{ maxWidth: 280 }}>
        <SegmentedControl
          value={v}
          onChange={setV}
          options={[
            { value: 'male', label: 'Мужской' },
            { value: 'female', label: 'Женский' },
          ]}
        />
      </div>
    )
  },
}
