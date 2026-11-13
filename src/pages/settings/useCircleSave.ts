import { FamilyNameTakenError } from '../../data/circles'
import { useSave } from '../../hooks/useSave'
import { useToast } from '../../hooks/useToast'

export function useCircleSave() {
  const save = useSave()
  const { toast } = useToast()

  return (write: Promise<void>) =>
    save(
      write.catch((error: unknown) => {
        if (!(error instanceof FamilyNameTakenError)) {
          throw error
        }

        void toast(error.message)
      }),
    )
}
