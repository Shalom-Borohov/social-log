import { useIonAlert } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'

const NAME_INPUT = 'name'

const isNameInput = (values: unknown): values is { [NAME_INPUT]: string } =>
  typeof values === 'object' && values !== null && NAME_INPUT in values && typeof values[NAME_INPUT] === 'string'

interface NamePrompt {
  header: string
  label: string
  name?: string
  onName: (name: string) => void
}

export function useNamePrompt() {
  const [presentAlert] = useIonAlert()

  return ({ header, label, name, onName }: NamePrompt) =>
    void presentAlert({
      header,
      inputs: [{ name: NAME_INPUT, type: 'text', value: name, placeholder: label, attributes: { 'aria-label': label } }],
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        {
          text: COMMON_COPY.save,
          handler: (values) => {
            const trimmed = isNameInput(values) && values[NAME_INPUT].trim()

            if (trimmed) {
              onName(trimmed)
            }
          },
        },
      ],
    })
}
