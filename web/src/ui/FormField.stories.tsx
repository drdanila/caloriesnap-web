import type { Meta, StoryObj } from '@storybook/react'
import { FormField, Input, Select } from './FormField'

const meta: Meta = {
  title: 'UI/FormField',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const TextInput: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Рост (см)" htmlFor="h">
        <Input id="h" placeholder="180" />
      </FormField>
    </div>
  ),
}

export const SelectField: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Уровень активности" htmlFor="a">
        <Select id="a" defaultValue="moderate">
          <option value="sedentary">Сидячий образ жизни</option>
          <option value="moderate">Умеренная активность</option>
          <option value="very_active">Очень высокая активность</option>
        </Select>
      </FormField>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <FormField label="Возраст" htmlFor="age" error="Заполните корректное значение">
        <Input id="age" placeholder="30" />
      </FormField>
    </div>
  ),
}
