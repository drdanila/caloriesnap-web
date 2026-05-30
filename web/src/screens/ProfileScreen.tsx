import { useEffect, useState } from 'react'
import {
  ActivityLevel,
  Gender,
  UserProfile,
  calculateTargets,
  saveUserProfile,
} from '../services/profileService'
import { Toast } from '../components/Toast'
import { Button, Card, FormField, Input, Select, SegmentedControl, Stat } from '../ui'
import { useT } from '../i18n/I18nProvider'
import { TKey } from '../i18n/dictionaries'
import './ProfileScreen.css'

interface ProfileScreenProps {
  userId: string
  initialProfile: UserProfile | null
  onSaved: (profile: UserProfile) => void
  onBack: () => void
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; key: TKey }[] = [
  { value: 'sedentary', key: 'activity_sedentary' },
  { value: 'light', key: 'activity_light' },
  { value: 'moderate', key: 'activity_moderate' },
  { value: 'active', key: 'activity_active' },
  { value: 'very_active', key: 'activity_very_active' },
]

export default function ProfileScreen({ userId, initialProfile, onSaved, onBack }: ProfileScreenProps) {
  const { t } = useT()
  const [heightCm, setHeightCm] = useState(initialProfile ? String(initialProfile.heightCm) : '')
  const [weightKg, setWeightKg] = useState(initialProfile ? String(initialProfile.weightKg) : '')
  const [targetWeightKg, setTargetWeightKg] = useState(
    initialProfile ? String(initialProfile.targetWeightKg) : ''
  )
  const [age, setAge] = useState(initialProfile ? String(initialProfile.age) : '')
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    initialProfile?.activityLevel || 'moderate'
  )
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)

  // Профиль грузится асинхронно в родителе — досинхронизируем поля формы.
  useEffect(() => {
    if (!initialProfile) return
    setHeightCm(String(initialProfile.heightCm))
    setWeightKg(String(initialProfile.weightKg))
    setTargetWeightKg(String(initialProfile.targetWeightKg))
    setAge(String(initialProfile.age))
    setGender(initialProfile.gender)
    setActivityLevel(initialProfile.activityLevel)
  }, [initialProfile])

  const h = parseFloat(heightCm)
  const w = parseFloat(weightKg)
  const tw = parseFloat(targetWeightKg)
  const a = parseFloat(age)

  const isValid =
    Number.isFinite(h) && h >= 50 && h <= 250 &&
    Number.isFinite(w) && w >= 20 && w <= 400 &&
    Number.isFinite(tw) && tw >= 20 && tw <= 400 &&
    Number.isFinite(a) && a >= 10 && a <= 120

  const candidate: UserProfile = {
    userId,
    heightCm: h,
    weightKg: w,
    targetWeightKg: tw,
    age: a,
    gender,
    activityLevel,
    updatedAt: new Date(),
  }

  const targets = isValid ? calculateTargets(candidate) : null

  const handleSave = async () => {
    if (!isValid) {
      setToast({ type: 'error', message: t('profile_invalid') })
      return
    }
    setSaving(true)
    try {
      await saveUserProfile(candidate)
      setToast({ type: 'success', message: t('profile_saved') })
      onSaved(candidate)
      onBack()
    } catch (error) {
      console.error('Failed to save profile:', error)
      setToast({ type: 'error', message: t('profile_saveError') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-screen">
      <Card className="profile-card">
        <h2 className="profile-card__title">{t('profile_title')}</h2>

        <FormField label={t('profile_height')} htmlFor="height">
          <Input id="height" type="number" inputMode="numeric" value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)} placeholder="180" />
        </FormField>

        <FormField label={t('profile_weight')} htmlFor="weight">
          <Input id="weight" type="number" inputMode="decimal" value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)} placeholder="85" />
        </FormField>

        <FormField label={t('profile_targetWeight')} htmlFor="target">
          <Input id="target" type="number" inputMode="decimal" value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(e.target.value)} placeholder="80" />
        </FormField>

        <FormField label={t('profile_age')} htmlFor="age">
          <Input id="age" type="number" inputMode="numeric" value={age}
            onChange={(e) => setAge(e.target.value)} placeholder="30" />
        </FormField>

        <FormField label={t('profile_gender')}>
          <SegmentedControl<Gender>
            value={gender}
            onChange={setGender}
            options={[
              { value: 'male', label: t('profile_male') },
              { value: 'female', label: t('profile_female') },
            ]}
          />
        </FormField>

        <FormField label={t('profile_activity')} htmlFor="activity">
          <Select id="activity" value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.key)}</option>
            ))}
          </Select>
        </FormField>

      </Card>

      <Card className="targets-card">
        <h3 className="targets-card__title">{t('profile_dailyTargets')}</h3>
        {targets ? (
          <div className="targets-grid">
            <Stat boxed value={targets.calories} label={t('target_kcal')} />
            <Stat boxed value={targets.protein} label={t('target_protein')} />
            <Stat boxed value={targets.fat} label={t('target_fat')} />
            <Stat boxed value={targets.carbs} label={t('target_carbs')} />
          </div>
        ) : (
          <p className="targets-placeholder">{t('profile_fillAll')}</p>
        )}
      </Card>

      <Button fullWidth size="lg" onClick={handleSave} loading={saving} disabled={!isValid}>
        {saving ? t('saving') : t('save')}
      </Button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
