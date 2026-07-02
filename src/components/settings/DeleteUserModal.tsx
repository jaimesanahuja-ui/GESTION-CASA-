import { useApp } from '../../state/AppContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { User } from '../../types'

export function DeleteUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { deleteUser } = useApp()

  function confirm() {
    deleteUser(user.id)
    onClose()
  }

  return (
    <Modal title={`🗑️ Eliminar a ${user.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-700">
          Esto quita a <strong>{user.name}</strong> de la casa: no volverá a salir en el reparto de zonas, ranking
          ni strikes. No se puede deshacer.
        </p>
        <p className="text-sm text-ink-500">
          Su nombre desaparecerá de las incidencias, inspecciones y asignaciones antiguas en las que aparecía (se
          mostrarán en blanco), pero esos registros no se borran.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={confirm}>
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
