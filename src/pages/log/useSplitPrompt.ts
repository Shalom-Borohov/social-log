import { useIonAlert } from '@ionic/react'
import { LIST_SEPARATOR } from '../../domain/format'
import { splitParts } from '../../domain/split'
import { LOG_COPY } from './copy'

interface SplitQuestion {
  text: string
  header: string
  onParts: (parts: string[]) => void
  onWhole: (text: string) => void
}

export function useSplitPrompt() {
  const [presentAlert] = useIonAlert()

  return function askSplit({ text, header, onParts, onWhole }: SplitQuestion) {
    const parts = splitParts(text)
    const [onlyPart, ...otherParts] = parts

    if (!onlyPart) {
      return
    }

    if (otherParts.length === 0) {
      onWhole(onlyPart)

      return
    }

    void presentAlert({
      header,
      message: parts.join(LIST_SEPARATOR),
      buttons: [
        { text: LOG_COPY.splitInto(parts.length), handler: () => onParts(parts) },
        { text: LOG_COPY.keepAsWritten, handler: () => onWhole(text) },
      ],
    })
  }
}
