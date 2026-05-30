import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const meta: Meta = {
  title: 'UI/Modal',
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

function Demo({ variant }: { variant: 'center' | 'sheet' }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Открыть {variant}</Button>
      <Modal open={open} onClose={() => setOpen(false)} variant={variant}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ margin: 0 }}>Удалить это блюдо?</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>Отмена</Button>
            <Button variant="danger" fullWidth onClick={() => setOpen(false)}>Удалить</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export const CenterDialog: Story = { render: () => <Demo variant="center" /> }
export const BottomSheet: Story = { render: () => <Demo variant="sheet" /> }
