import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

const wrap: React.CSSProperties = { padding: 24, fontFamily: 'var(--font-sans)', color: 'var(--c-text)' }

const COLORS = [
  '--c-mint', '--c-green', '--c-green-600', '--c-green-700', '--c-green-800',
  '--c-green-50', '--c-green-100', '--c-bg', '--c-surface', '--c-surface-2',
  '--c-text', '--c-text-2', '--c-text-3', '--c-border',
  '--c-success', '--c-warning', '--c-danger',
]
const RADII = ['--r-sm', '--r-md', '--r-lg', '--r-xl', '--r-pill']
const SHADOWS = ['--sh-sm', '--sh-md', '--sh-lg', '--sh-primary']
const TYPE = ['--fs-xs', '--fs-sm', '--fs-md', '--fs-lg', '--fs-xl', '--fs-2xl', '--fs-3xl', '--fs-display']
const SPACING = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-7', '--s-8']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ marginBottom: 16, fontSize: 'var(--fs-lg)' }}>{title}</h3>
      {children}
    </section>
  )
}

export const All: Story = {
  render: () => (
    <div style={wrap}>
      <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 24 }}>CalorieSnap — Design Tokens</h2>

      <Section title="Color">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {COLORS.map((c) => (
            <div key={c}>
              <div style={{ height: 56, borderRadius: 'var(--r-md)', background: `var(${c})`, border: '1px solid var(--c-border)' }} />
              <code style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{c}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {RADII.map((r) => (
            <div key={r} style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, background: 'var(--grad-mint)', borderRadius: `var(${r})` }} />
              <code style={{ fontSize: 11 }}>{r}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadow">
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {SHADOWS.map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{ width: 96, height: 72, background: 'var(--c-surface)', borderRadius: 'var(--r-lg)', boxShadow: `var(${s})` }} />
              <code style={{ fontSize: 11 }}>{s}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        {TYPE.map((t) => (
          <div key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
            <code style={{ fontSize: 11, width: 110, color: 'var(--c-text-3)' }}>{t}</code>
            <span style={{ fontSize: `var(${t})`, fontWeight: 600 }}>CalorieSnap 123</span>
          </div>
        ))}
      </Section>

      <Section title="Spacing">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          {SPACING.map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{ width: `var(${s})`, height: `var(${s})`, background: 'var(--c-green-600)', borderRadius: 4 }} />
              <code style={{ fontSize: 10 }}>{s}</code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
}
